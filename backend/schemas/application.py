from pydantic import BaseModel
from datetime import datetime

class ApplicationBase(BaseModel):
    job_id: int
    resume_url: str

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationUpdate(BaseModel):
    status: str

class ApplicationResponse(ApplicationBase):
    id: int
    user_id: int
    status: str
    applied_at: datetime
    
    class Config:
        from_attributes = True
