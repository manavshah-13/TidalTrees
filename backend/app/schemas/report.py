from datetime import datetime
from pydantic import BaseModel, Field, field_validator


class ReportCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=10)
    location: str = Field(..., max_length=255)
    latitude: float | None = Field(default=None, ge=-90.0, le=90.0)
    longitude: float | None = Field(default=None, ge=-180.0, le=180.0)
    severity: str = Field(..., pattern="^(low|medium|high|critical)$")
    image_url: str | None = None

    @field_validator("latitude")
    @classmethod
    def validate_latitude(cls, v: float | None) -> float | None:
        if v is not None and not (-90.0 <= v <= 90.0):
            raise ValueError("Latitude must be between -90.0 and 90.0 degrees")
        return v

    @field_validator("longitude")
    @classmethod
    def validate_longitude(cls, v: float | None) -> float | None:
        if v is not None and not (-180.0 <= v <= 180.0):
            raise ValueError("Longitude must be between -180.0 and 180.0 degrees")
        return v


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
