from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from app.database import get_db
from app.models.user import User
from app.services.cache import get_cached_json, set_cached_json

router = APIRouter(prefix="/api/leaderboard", tags=["Leaderboard"])

LEADERBOARD_CACHE_KEY = "leaderboard:top"
CACHE_TTL = 300


@router.get("", response_model=Dict[str, Any])
def get_leaderboard(db: Session = Depends(get_db)):
    cached_data = get_cached_json(LEADERBOARD_CACHE_KEY)
    if cached_data is not None:
        return {
            "leaderboard": cached_data,
            "cached": True,
            "total": len(cached_data),
        }

    users = db.query(User).order_by(User.points.desc()).limit(50).all()
    user_data = [
        {
            "id": u.id,
            "username": u.username,
            "points": u.points,
            "reports_count": u.reports_count,
        }
        for u in users
    ]
    set_cached_json(LEADERBOARD_CACHE_KEY, user_data, expire_seconds=CACHE_TTL)
    return {
        "leaderboard": user_data,
        "cached": False,
        "total": len(user_data),
    }
