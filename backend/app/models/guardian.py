from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime

from app.database import Base


class Guardian(Base):
    __tablename__ = "guardians"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    contact = Column(String(120), nullable=False)
    location = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
