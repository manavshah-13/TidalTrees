from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from app.database import get_db
from app.limiter import limiter
from app.models.contact import ContactMessage
from app.models.guardian import Guardian

router = APIRouter(prefix="/api", tags=["Contact & Guardians"])


class ContactCreate(BaseModel):
    name: str
    email: str
    subject: str
    message: str


class GuardianResponse(BaseModel):
    id: int
    name: str
    contact: str
    location: str | None

    model_config = {"from_attributes": True}


@router.post("/contact", status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def submit_contact(
    request: Request,
    msg: ContactCreate,
    db: Session = Depends(get_db),
):
    contact = ContactMessage(
        name=msg.name,
        email=msg.email,
        subject=msg.subject,
        message=msg.message,
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return {"status": "success", "message": "Inquiry submitted successfully"}


@router.get("/guardians", response_model=List[GuardianResponse])
def get_guardians(db: Session = Depends(get_db)):
    guardians = db.query(Guardian).all()
    # If no guardians in DB yet, seed initial sample guardians for the community
    if not guardians:
        sample_guardians = [
            Guardian(name="Sunderbans Coastal Watch", contact="+91 98201 12345", location="Sundarbans Delta"),
            Guardian(name="Pichavaram Mangrove Patrol", contact="+91 94441 67890", location="Pichavaram, Tamil Nadu"),
            Guardian(name="Gulf of Kutch Ranger Force", contact="+91 98791 24680", location="Kutch, Gujarat"),
            Guardian(name="Bhitarkanika Wildlife Society", contact="+91 99370 13579", location="Bhitarkanika, Odisha"),
        ]
        db.add_all(sample_guardians)
        db.commit()
        guardians = db.query(Guardian).all()
    return guardians
