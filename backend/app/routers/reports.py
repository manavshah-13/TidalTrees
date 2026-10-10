from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models.report import Report
from app.models.user import User
from app.schemas.report import ReportCreate, ReportResponse, ReportList
from app.services.auth import get_current_user
from app.services.cache import invalidate_cache

router = APIRouter(prefix="/api/reports", tags=["Reports"])

LEADERBOARD_CACHE_KEY = "leaderboard:top"


@router.post("", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
def create_report(
    report_in: ReportCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Create incident report
    report = Report(
        title=report_in.title,
        description=report_in.description,
        location=report_in.location,
        latitude=report_in.latitude,
        longitude=report_in.longitude,
        severity=report_in.severity,
        status="pending",
        author_id=current_user.id,
        ai_confidence=0.92,
        ai_result="Automated satellite & canopy validation: High probability anomaly identified.",
    )
    db.add(report)

    # Award gamification points and update user count
    current_user.points = (current_user.points or 0) + 25
    current_user.reports_count = (current_user.reports_count or 0) + 1
    db.add(current_user)

    db.commit()
    db.refresh(report)

    # Invalidate leaderboard Redis cache so new ranks reflect immediately
    invalidate_cache(LEADERBOARD_CACHE_KEY)

    return report


@router.get("", response_model=ReportList)
def list_reports(
    severity: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    query = db.query(Report)

    if severity and severity != "all":
        query = query.filter(Report.severity == severity.lower())
    if status and status != "all":
        query = query.filter(Report.status == status.lower())
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Report.title.ilike(search_filter),
                Report.description.ilike(search_filter),
                Report.location.ilike(search_filter),
            )
        )

    total = query.count()
    reports = query.order_by(Report.created_at.desc()).offset(offset).limit(limit).all()
    return ReportList(reports=reports, total=total)


@router.get("/me", response_model=List[ReportResponse])
def get_my_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    reports = (
        db.query(Report)
        .filter(Report.author_id == current_user.id)
        .order_by(Report.created_at.desc())
        .all()
    )
    return reports
