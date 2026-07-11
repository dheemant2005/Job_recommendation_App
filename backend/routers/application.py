from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from utils.oauth2 import get_current_user
from models.application import Application
from schemas.application import ApplicationCreate, ApplicationUpdate, ApplicationResponse
from models.users import User

router = APIRouter(prefix="/applications", tags=["Applications"])

@router.post("/", response_model=ApplicationResponse)
async def create_application(
    application: ApplicationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if user already applied for this job
    result = await db.execute(
        select(Application).where(
            Application.job_id == application.job_id,
            Application.user_id == current_user.id
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Already applied for this job")
    
    db_application = Application(
        job_id=application.job_id,
        user_id=current_user.id,
        resume_url=application.resume_url,
        status="pending"
    )
    db.add(db_application)
    await db.commit()
    await db.refresh(db_application)
    return db_application

@router.get("/my", response_model=list[ApplicationResponse])
async def get_my_applications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Application).where(Application.user_id == current_user.id)
    )
    return result.scalars().all()

@router.get("/all", response_model=list[ApplicationResponse])
async def get_all_applications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = await db.execute(select(Application))
    return result.scalars().all()

@router.patch("/{application_id}", response_model=ApplicationResponse)
async def update_application_status(
    application_id: int,
    update: ApplicationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = await db.execute(
        select(Application).where(Application.id == application_id)
    )
    application = result.scalar_one_or_none()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    application.status = update.status
    await db.commit()
    await db.refresh(application)
    return application
