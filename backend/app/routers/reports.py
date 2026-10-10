from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.report import Report
from app.schemas.report import ReportCreate, ReportResponse, ReportList
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.post("/", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
def create_report(
    report_data: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = Report(
        **report_data.model_dump(),
        author_id=current_user.id,
    )
    db.add(report)

    # Increment user's report count
    current_user.reports_count += 1
    current_user.points += 10  # Award points for submitting

    db.commit()
    db.refresh(report)
    return report


@router.get("/", response_model=ReportList)
def list_reports(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    severity: str | None = None,
    status_filter: str | None = Query(None, alias="status"),
    db: Session = Depends(get_db),
):
    query = db.query(Report)

    if severity:
        query = query.filter(Report.severity == severity)
    if status_filter:
        query = query.filter(Report.status == status_filter)

    total = query.count()
    reports = query.order_by(Report.created_at.desc()).offset(skip).limit(limit).all()
    return ReportList(reports=reports, total=total)


@router.get("/{report_id}", response_model=ReportResponse)
def get_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if report.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this report")

    db.delete(report)
    db.commit()
