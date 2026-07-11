from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Application(Base):
    __tablename__ = "applications"
    
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    resume_url = Column(String(1024), nullable=False)
    status = Column(String(50), default="pending")
    applied_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    job = relationship("Job", backref="applications")
    user = relationship("User", backref="applications")
