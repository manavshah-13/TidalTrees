from datetime import datetime
from pydantic import BaseModel, Field


class ReportCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=10)
    location: str = Field(..., max_length=255)
    latitude: float | None = None
    longitude: float | None = None
    severity: str = Field(..., pattern="^(low|medium|high|critical)$")


class ReportResponse(BaseModel):
    id: int
    title: str
    description: str
    location: str
    latitude: float | None
    longitude: float | None
    severity: str
    status: str
    image_url: str | None
    ai_confidence: float | None
    author_id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class ReportList(BaseModel):
    reports: list[ReportResponse]
    total: int
