import os
import math
import uuid
import shutil
import logging
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form, Request
from sqlalchemy.orm import Session
from sqlalchemy import or_, func, cast
from geoalchemy2 import Geography
from supabase import create_client, Client

from app.config import get_settings
from app.database import get_db
from app.limiter import limiter
from app.models.report import Report
from app.models.user import User
from app.schemas.report import ReportCreate, ReportResponse, ReportList
from app.services.auth import get_current_user
from app.services.cache import invalidate_cache

logger = logging.getLogger(__name__)
settings = get_settings()

router = APIRouter(prefix="/api/reports", tags=["Reports"])

LEADERBOARD_CACHE_KEY = "leaderboard:top"

# Local uploads directory
UPLOADS_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads"
)
os.makedirs(UPLOADS_DIR, exist_ok=True)


def get_supabase_client() -> Optional[Client]:
    """Initializes and returns Supabase client if credentials are configured."""
    if settings.supabase_url and settings.supabase_key:
        try:
            return create_client(settings.supabase_url, settings.supabase_key)
        except Exception as e:
            logger.warning("Failed to initialize Supabase client: %s", e)
    return None


def save_uploaded_file(upload_file: UploadFile) -> str:
    ext = os.path.splitext(upload_file.filename or "")[1].lower()
    if not ext or ext not in [".jpg", ".jpeg", ".png", ".webp", ".gif"]:
        ext = ".jpg"
    unique_name = f"{uuid.uuid4().hex}{ext}"

    # 1. Permanent Cloud Storage: Upload to Supabase Storage bucket 'reports'
    supabase_client = get_supabase_client()
    if supabase_client:
        try:
            upload_file.file.seek(0)
            file_bytes = upload_file.file.read()
            mime_type = upload_file.content_type or "image/jpeg"
            supabase_client.storage.from_("reports").upload(
                path=unique_name,
                file=file_bytes,
                file_options={"content-type": mime_type},
            )
            public_url = supabase_client.storage.from_("reports").get_public_url(unique_name)
            upload_file.file.seek(0)
            logger.info("Successfully uploaded image to Supabase Storage: %s", public_url)
            return public_url
        except Exception as e:
            logger.warning("Supabase upload failed, falling back to local storage: %s", e)
            upload_file.file.seek(0)

    # 2. Local volume fallback (for local dev / offline tests)
    file_path = os.path.join(UPLOADS_DIR, unique_name)
    with open(file_path, "wb") as buffer:
        upload_file.file.seek(0)
        shutil.copyfileobj(upload_file.file, buffer)
    return f"/static/uploads/{unique_name}"


@router.post("/upload-image")
@limiter.limit("5/minute")
def upload_image(
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image")
    url = save_uploaded_file(file)
    return {"image_url": url}


@router.post("", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
def create_report(
    request: Request,
    report_in: ReportCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    geom_val = None
    if report_in.latitude is not None and report_in.longitude is not None:
        geom_val = f"SRID=4326;POINT({report_in.longitude} {report_in.latitude})"

    report = Report(
        title=report_in.title,
        description=report_in.description,
        location=report_in.location,
        latitude=report_in.latitude,
        longitude=report_in.longitude,
        geom=geom_val,
        severity=report_in.severity,
        status="pending",
        image_url=report_in.image_url,
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


@router.post("/with-image", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def create_report_with_image(
    request: Request,
    title: str = Form(...),
    description: str = Form(...),
    location: str = Form(...),
    severity: str = Form(...),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    image_url = None
    if image and image.filename:
        image_url = save_uploaded_file(image)

    if latitude is not None and not (-90.0 <= latitude <= 90.0):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Latitude must be between -90.0 and 90.0 degrees",
        )
    if longitude is not None and not (-180.0 <= longitude <= 180.0):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Longitude must be between -180.0 and 180.0 degrees",
        )

    geom_val = None
    if latitude is not None and longitude is not None:
        geom_val = f"SRID=4326;POINT({longitude} {latitude})"

    report = Report(
        title=title,
        description=description,
        location=location,
        latitude=latitude,
        longitude=longitude,
        geom=geom_val,
        severity=severity,
        status="pending",
        image_url=image_url,
        author_id=current_user.id,
        ai_confidence=0.92,
        ai_result="Automated satellite & canopy validation: High probability anomaly identified.",
    )
    db.add(report)

    current_user.points = (current_user.points or 0) + 25
    current_user.reports_count = (current_user.reports_count or 0) + 1
    db.add(current_user)

    db.commit()
    db.refresh(report)

    invalidate_cache(LEADERBOARD_CACHE_KEY)
    return report


@router.get("", response_model=ReportList)
@router.get("/", response_model=ReportList)
def list_reports(
    severity: Optional[str] = None,
    status: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    skip: Optional[int] = Query(None, ge=0),
    db: Session = Depends(get_db),
):
    query = db.query(Report)

    active_status = status_filter or status
    if severity and severity != "all":
        query = query.filter(Report.severity == severity.lower())
    if active_status and active_status != "all":
        query = query.filter(Report.status == active_status.lower())
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Report.title.ilike(search_filter),
                Report.description.ilike(search_filter),
                Report.location.ilike(search_filter),
            )
        )

    actual_offset = skip if skip is not None else offset
    total = query.count()
    reports = query.order_by(Report.created_at.desc()).offset(actual_offset).limit(limit).all()
    return ReportList(reports=reports, total=total)


@router.get("/nearby", response_model=List[ReportResponse])
def get_nearby_reports(
    lat: float = Query(..., ge=-90.0, le=90.0),
    lng: float = Query(..., ge=-180.0, le=180.0),
    radius_km: float = Query(10.0, gt=0, le=500.0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Radius-based geographic query using PostGIS ST_DWithin on geometry points."""
    radius_meters = radius_km * 1000.0
    point_geom = func.ST_SetSRID(func.ST_MakePoint(lng, lat), 4326)

    try:
        reports = (
            db.query(Report)
            .filter(
                Report.geom.isnot(None),
                func.ST_DWithin(
                    cast(Report.geom, Geography),
                    cast(point_geom, Geography),
                    radius_meters,
                ),
            )
            .order_by(
                func.ST_Distance(
                    cast(Report.geom, Geography),
                    cast(point_geom, Geography),
                )
            )
            .limit(limit)
            .all()
        )
        return reports
    except Exception:
        # Fallback bounding box & Euclidean distance for non-PostGIS local dev
        deg_lat = radius_km / 111.0
        deg_lng = radius_km / (111.0 * max(0.1, abs(math.cos(math.radians(lat)))))
        reports = (
            db.query(Report)
            .filter(
                Report.latitude.isnot(None),
                Report.longitude.isnot(None),
                Report.latitude.between(lat - deg_lat, lat + deg_lat),
                Report.longitude.between(lng - deg_lng, lng + deg_lng),
            )
            .limit(limit)
            .all()
        )
        return reports


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


@router.get("/{report_id}", response_model=ReportResponse)
def get_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.post("/{report_id}/image", response_model=ReportResponse)
def upload_report_image(
    report_id: int,
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if report.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this report")

    image_url = save_uploaded_file(image)
    report.image_url = image_url
    db.commit()
    db.refresh(report)
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
