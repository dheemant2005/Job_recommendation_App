import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from services.qdrant_service import search_jobs

load_dotenv()

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.3,
)

rag_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a job search assistant.
Use the following job listings retrieved from the database to answer the user's question.
If no relevant jobs are found, say so clearly.

Retrieved Jobs:
{context}"""),
    ("human", "{question}")
])

rag_chain = rag_prompt | llm


def rag_job_search(question: str) -> str:
    results = search_jobs(question, top_k=5)

    if not results:
        return "No jobs found in the database. Please embed jobs first using the /rag/embed-jobs endpoint."

    context = "\n".join([
        f"- {r['title']}: {r['description']} (Salary: {r['salary']}, Match: {r['score']})"
        for r in results
    ])

    try:
        response = rag_chain.invoke({"context": context, "question": question})
        return response.content
    except Exception as e:
        api_key = os.getenv("GROQ_API_KEY", "")
        if "dummy" in api_key or "invalid" in str(e).lower() or "401" in str(e):
            return (
                f"🤖 [DEMO MODE - Mock RAG Response]\n\n"
                f"To get real AI answers based on database jobs, please set a valid `GROQ_API_KEY` in `backend/.env`.\n\n"
                f"Here are the top matching jobs retrieved from the database for your query \"{question}\":\n\n"
                f"{context}"
            )
        raise e

