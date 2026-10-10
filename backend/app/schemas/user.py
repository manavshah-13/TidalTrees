from datetime import datetime
from pydantic import BaseModel


class UserResponse(BaseModel):
    id: int
    username: str
    email: str | None = None
    is_active: bool
    points: int
    reports_count: int
    created_at: datetime

    model_config = {"from_attributes": True}


class UserPublic(BaseModel):
    """Public-facing user info (for leaderboard, etc.)"""
    id: int
    username: str
    points: int
    reports_count: int

    model_config = {"from_attributes": True}
