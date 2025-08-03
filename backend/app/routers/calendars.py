from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, and_

from ..db.session import get_db
from ..models.models import Event
from ..schemas.schemas import (
    EventCreate,
    EventOut,
    ICalConnectRequest,
    GoogleConnectRequest,
    AlexaConnectRequest,
)

router = APIRouter()


@router.get("/", response_model=List[EventOut])
def get_week_events(
    db: Session = Depends(get_db),
    family_id: int = Query(..., description="Family group ID"),
    week_start: datetime = Query(..., description="ISO datetime for week start"),
    week_end: datetime = Query(None, description="Optional ISO datetime for week end (defaults to +7 days)"),
):
    """
    Returns all events intersecting [week_start, week_end).
    """
    if week_end is None:
        week_end = week_start + timedelta(days=7)

    rows = db.execute(
        select(Event).where(
            and_(
                Event.family_id == family_id,
                Event.start_time < week_end,
                Event.end_time > week_start,
            )
        )
    ).scalars().all()
    return rows


@router.post("/", response_model=EventOut)
def create_event(payload: EventCreate, db: Session = Depends(get_db)):
    if payload.end_time <= payload.start_time:
        raise HTTPException(status_code=400, detail="end_time must be after start_time")
    ev = Event(
        family_id=payload.family_id,
        title=payload.title,
        description=payload.description,
        emoji=payload.emoji,
        start_time=payload.start_time,
        end_time=payload.end_time,
        source=payload.source,
        source_id=payload.source_id,
        created_at=datetime.utcnow(),
    )
    db.add(ev)
    db.commit()
    db.refresh(ev)
    return ev


@router.post("/ical")
def add_ical_feed(req: ICalConnectRequest):
    # Placeholder: persist feed URL per family and schedule sync
    return {"message": "iCal feed registered (dev mock)", "url": req.url}


@router.post("/google")
def connect_google(req: GoogleConnectRequest):
    # Placeholder: exchange code for tokens and persist
    return {"message": "Google Calendar connected (dev mock)", "code": req.code}


@router.post("/alexa")
def connect_alexa(req: AlexaConnectRequest):
    # Placeholder: store token and allow pulling reminders
    return {"message": "Alexa Reminders connected (dev mock)", "token": req.token}


@router.get("/sync")
def force_sync():
    # Placeholder: enqueue background sync job for calendars
    return {"message": "Sync started (dev mock)"}