import os
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from fastembed import TextEmbedding
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.job import Job

load_dotenv()

COLLECTION_NAME = "job_descriptions"
VECTOR_SIZE = 384  # BAAI/bge-small-en-v1.5 outputs 384-dim vectors

import logging
import socket

logger = logging.getLogger(__name__)

qdrant_url = os.getenv("QDRANT_URL")
qdrant_api_key = os.getenv("QDRANT_API_KEY")

if qdrant_url and ("localhost" in qdrant_url or "127.0.0.1" in qdrant_url):
    try:
        # Check if local Qdrant server is running on port 6333
        with socket.create_connection(("localhost", 6333), timeout=1.0):
            qdrant = QdrantClient(url=qdrant_url, api_key=qdrant_api_key)
            logger.info("Connected to local Qdrant server on port 6333.")
    except (socket.timeout, ConnectionRefusedError):
        logger.warning("Local Qdrant server not found on port 6333. Falling back to local file-based Qdrant storage at './local_qdrant_db'")
        qdrant = QdrantClient(path="./local_qdrant_db")
else:
    qdrant = QdrantClient(
        url=qdrant_url,
        api_key=qdrant_api_key,
    )


# Free embedding model — no API key needed, lightweight (no PyTorch)
embeddings_model = TextEmbedding("BAAI/bge-small-en-v1.5")


def ensure_collection():
    collections = [c.name for c in qdrant.get_collections().collections]
    if COLLECTION_NAME in collections:
        # Delete old collection if vector size changed (e.g. switched embedding model)
        info = qdrant.get_collection(COLLECTION_NAME)
        existing_size = info.config.params.vectors.size
        if existing_size != VECTOR_SIZE:
            qdrant.delete_collection(COLLECTION_NAME)
            collections.remove(COLLECTION_NAME)
    if COLLECTION_NAME not in collections:
        qdrant.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE)
        )


def embed_text(text: str) -> list[float]:
    return next(embeddings_model.embed([text])).tolist()


async def embed_all_jobs(db: AsyncSession) -> int:
    ensure_collection()
    result = await db.execute(select(Job))
    jobs = result.scalars().all()
    if not jobs:
        return 0

    points = []
    for job in jobs:
        text = f"{job.title} {job.description or ''}"
        vector = embed_text(text)
        points.append(
            PointStruct(
                id=job.id,
                vector=vector,
                payload={"title": job.title, "description": job.description or "", "salary": job.salary, "job_id": job.id}
            )
        )

    qdrant.upsert(collection_name=COLLECTION_NAME, points=points)
    return len(points)

def search_jobs(query: str, top_k: int = 5) -> list[dict]:
    ensure_collection()
    query_vector = embed_text(query)
    results = qdrant.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector,
        limit=top_k
    )
    return [
        {
            "job_id": hit.payload.get("job_id"),
            "title": hit.payload.get("title"),
            "description": hit.payload.get("description"),
            "salary": hit.payload.get("salary"),
            "score": round(hit.score, 4)
        }
        for hit in results.points
    ]


def match_jobs_for_profile(skills: str, experience: str, top_k: int = 5) -> list[dict]:
    ensure_collection()
    profile_text = f"Skills: {skills}. Experience: {experience}"
    profile_vector = embed_text(profile_text)
    results = qdrant.query_points(
        collection_name=COLLECTION_NAME,
        query=profile_vector,
        limit=top_k
    )
    return [
        {
            "job_id": hit.payload.get("job_id"),
            "title": hit.payload.get("title"),
            "description": hit.payload.get("description"),
            "salary": hit.payload.get("salary"),
            "match_score": round(hit.score * 100, 2)
        }
        for hit in results.points
    ]
