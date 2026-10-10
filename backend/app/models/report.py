from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry

from app.database import Base


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # PostGIS geometry point (SRID 4326 - WGS 84 GPS standard)
    geom = Column(Geometry(geometry_type="POINT", srid=4326, spatial_index=True), nullable=True)

    severity = Column(String(50), nullable=False)  # low, medium, high, critical
    status = Column(String(50), default="pending")  # pending, validated, rejected
    image_url = Column(String(500), nullable=True)

    # AI validation
    ai_confidence = Column(Float, nullable=True)
    ai_result = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Foreign keys
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Relationships
    author = relationship("User", back_populates="reports")
