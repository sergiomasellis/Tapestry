from datetime import datetime, timedelta, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, and_

from ..db.session import get_db
from ..models.models import Event, User
from ..schemas.schemas import (
    EventCreate,
    EventUpdate,
    EventOut,
    ICalConnectRequest,
    GoogleConnectRequest,
    AlexaConnectRequest,
    Message,
)
from .auth import get_current_user

router = APIRouter()


@router.get("/", response_model=List[EventOut])
def get_week_events(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    family_id: int = Query(..., description="Family group ID"),
    week_start: datetime = Query(..., description="ISO datetime for week start"),
    week_end: datetime = Query(
        None, description="Optional ISO datetime for week end (defaults to +7 days)"
    ),
):
    """
    Returns all events intersecting [week_start, week_end).
    Requires authentication and family membership.
    """
    if not current_user.family_id:
        return []

    # Check if user belongs to the requested family
    if current_user.family_id != family_id:
        raise HTTPException(status_code=403, detail="Access denied")

    if week_end is None:
        week_end = week_start + timedelta(days=7)

    rows = (
        db.execute(
            select(Event).where(
                and_(
                    Event.family_id == family_id,
                    Event.start_time < week_end,
                    Event.end_time > week_start,
                )
            )
        )
        .scalars()
        .all()
    )
    return rows


@router.post("/", response_model=EventOut)
def create_event(
    payload: EventCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create an event. Requires authentication and family membership."""
    if not current_user.family_id:
        raise HTTPException(status_code=400, detail="User must belong to a family")

    # Ensure event belongs to user's family
    if payload.family_id != current_user.family_id:
        raise HTTPException(
            status_code=403, detail="Cannot create event for different family"
        )

    # Convert timezone-aware datetimes to timezone-naive UTC for SQLite compatibility
    start_time = payload.start_time
    if start_time.tzinfo is not None:
        start_time = start_time.astimezone(timezone.utc).replace(tzinfo=None)

    end_time = payload.end_time
    if end_time.tzinfo is not None:
        end_time = end_time.astimezone(timezone.utc).replace(tzinfo=None)

    if end_time <= start_time:
        raise HTTPException(status_code=400, detail="end_time must be after start_time")

    ev = Event(
        family_id=payload.family_id,
        title=payload.title,
        description=payload.description,
        emoji=payload.emoji,
        start_time=start_time,
        end_time=end_time,
        source=payload.source,
        source_id=payload.source_id,
        created_at=datetime.utcnow(),
    )
    db.add(ev)
    db.commit()
    db.refresh(ev)
    return ev


@router.post("/ical")
def add_ical_feed(
    req: ICalConnectRequest, current_user: User = Depends(get_current_user)
):
    """Add iCal feed. Requires authentication."""
    # Placeholder: persist feed URL per family and schedule sync
    return {"message": "iCal feed registered (dev mock)", "url": req.url}


@router.post("/google")
def connect_google(
    req: GoogleConnectRequest, current_user: User = Depends(get_current_user)
):
    """Connect Google Calendar. Requires authentication."""
    # Placeholder: exchange code for tokens and persist
    return {"message": "Google Calendar connected (dev mock)", "code": req.code}


@router.post("/alexa")
def connect_alexa(
    req: AlexaConnectRequest, current_user: User = Depends(get_current_user)
):
    """Connect Alexa. Requires authentication."""
    # Placeholder: store token and allow pulling reminders
    return {"message": "Alexa Reminders connected (dev mock)", "token": req.token}


@router.put("/{event_id}", response_model=EventOut)
def update_event(
    event_id: int,
    payload: EventUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update an event. Requires authentication and family membership."""
    event = db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Check if user belongs to the same family
    if current_user.family_id != event.family_id:
        raise HTTPException(status_code=403, detail="Access denied")

    updates = payload.model_dump(exclude_unset=True)

    # Convert timezone-aware datetimes to timezone-naive UTC for SQLite compatibility
    if "start_time" in updates and isinstance(updates["start_time"], datetime):
        dt = updates["start_time"]
        if dt.tzinfo is not None:
            updates["start_time"] = dt.astimezone(timezone.utc).replace(tzinfo=None)

    if "end_time" in updates and isinstance(updates["end_time"], datetime):
        dt = updates["end_time"]
        if dt.tzinfo is not None:
            updates["end_time"] = dt.astimezone(timezone.utc).replace(tzinfo=None)

    if "end_time" in updates and "start_time" in updates:
        if updates["end_time"] <= updates["start_time"]:
            raise HTTPException(
                status_code=400, detail="end_time must be after start_time"
            )
    elif "end_time" in updates and event.start_time:
        if updates["end_time"] <= event.start_time:
            raise HTTPException(
                status_code=400, detail="end_time must be after start_time"
            )
    elif "start_time" in updates and event.end_time:
        if event.end_time <= updates["start_time"]:
            raise HTTPException(
                status_code=400, detail="end_time must be after start_time"
            )

    for k, v in updates.items():
        setattr(event, k, v)
    db.commit()
    # Return the event object directly - it's already updated in memory
    # Avoid db.refresh() which can cause SQLite datetime read issues
    return event


@router.delete("/{event_id}", response_model=Message)
def delete_event(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete an event. Requires authentication and family membership."""
    event = db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Check if user belongs to the same family
    if current_user.family_id != event.family_id:
        raise HTTPException(status_code=403, detail="Access denied")

    db.delete(event)
    db.commit()
    return Message(message="deleted")


@router.get("/sync")
def force_sync(current_user: User = Depends(get_current_user)):
    """Force calendar sync. Requires authentication."""
    # Placeholder: enqueue background sync job for calendars
    return {"message": "Sync started (dev mock)"}
