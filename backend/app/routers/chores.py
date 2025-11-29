from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import date, datetime
from typing import List

from ..db.session import get_db
from ..models.models import Chore, Point, User
from ..schemas.schemas import ChoreCreate, ChoreOut, ChoreUpdate, Message
from .auth import get_current_user

router = APIRouter()


@router.get("/", response_model=List[ChoreOut])
def list_chores(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List chores for the user's family. Requires authentication."""
    if not current_user.family_id:
        return []
    rows = db.execute(select(Chore).where(Chore.family_id == current_user.family_id)).scalars().all()
    return rows


@router.post("/", response_model=ChoreOut)
def create_chore(
    payload: ChoreCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new chore. Requires authentication and family membership."""
    if not current_user.family_id:
        raise HTTPException(status_code=400, detail="User must belong to a family")
    
    if payload.point_value < 1 or payload.point_value > 10:
        raise HTTPException(status_code=400, detail="point_value must be 1..10")
    
    # Ensure chore belongs to user's family
    if payload.family_id != current_user.family_id:
        raise HTTPException(status_code=403, detail="Cannot create chore for different family")
    
    chore = Chore(
        family_id=payload.family_id,
        title=payload.title,
        description=payload.description,
        emoji=payload.emoji,
        point_value=payload.point_value,
        assigned_to=payload.assigned_to,
        assigned_to_ids=payload.assigned_to_ids,
        is_group_chore=payload.is_group_chore,
        completed=payload.completed,
        completed_by_ids=payload.completed_by_ids,
        week_start=payload.week_start,
        created_at=datetime.utcnow(),
        is_recurring=payload.is_recurring,
        recurrence_type=payload.recurrence_type,
        recurrence_interval=payload.recurrence_interval,
        recurrence_count=payload.recurrence_count,
        recurrence_days=payload.recurrence_days,
        recurrence_time_of_day=payload.recurrence_time_of_day,
        recurrence_end_date=payload.recurrence_end_date,
        parent_chore_id=payload.parent_chore_id,
    )
    db.add(chore)
    db.commit()
    db.refresh(chore)
    return chore


@router.put("/{chore_id}", response_model=ChoreOut)
def update_chore(
    chore_id: int,
    payload: ChoreUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a chore. Requires authentication and family membership."""
    chore = db.get(Chore, chore_id)
    if not chore:
        raise HTTPException(status_code=404, detail="Chore not found")
    
    # Check if user belongs to the same family
    if current_user.family_id != chore.family_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    updates = payload.model_dump(exclude_unset=True)
    if "point_value" in updates:
        pv = updates["point_value"]
        if pv is not None and (pv < 1 or pv > 10):
            raise HTTPException(status_code=400, detail="point_value must be 1..10")
    for k, v in updates.items():
        setattr(chore, k, v)
    db.commit()
    db.refresh(chore)
    return chore


@router.delete("/{chore_id}", response_model=Message)
def delete_chore(
    chore_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a chore. Requires authentication and family membership."""
    chore = db.get(Chore, chore_id)
    if not chore:
        raise HTTPException(status_code=404, detail="Chore not found")
    
    # Check if user belongs to the same family
    if current_user.family_id != chore.family_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    db.delete(chore)
    db.commit()
    return Message(message="deleted")


@router.post("/{chore_id}/complete", response_model=ChoreOut)
def complete_chore(
    chore_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark a chore as complete. Behavior depends on chore type:
    - Group chore: Marks complete for everyone, awards points to first assignee
    - Individual chore: Toggles completion for the current user only
    """
    chore = db.get(Chore, chore_id)
    if not chore:
        raise HTTPException(status_code=404, detail="Chore not found")
    
    # Check if user belongs to the same family
    if current_user.family_id != chore.family_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get all assignee IDs
    assignee_ids = []
    if chore.assigned_to_ids:
        assignee_ids = [int(x) for x in chore.assigned_to_ids.split(",") if x.strip()]
    elif chore.assigned_to:
        assignee_ids = [chore.assigned_to]
    
    if chore.is_group_chore:
        # GROUP CHORE: Toggle completion for everyone
        chore.completed = not chore.completed
        
        if chore.completed:
            # Award points to all assignees (or current user if unassigned)
            users_to_award = assignee_ids if assignee_ids else [current_user.id]
            for user_id in users_to_award:
                existing_point = db.query(Point).filter(
                    Point.chore_id == chore_id,
                    Point.user_id == user_id
                ).first()
                if not existing_point:
                    point = Point(
                        user_id=user_id,
                        chore_id=chore_id,
                        points=chore.point_value,
                        awarded_at=datetime.utcnow(),
                    )
                    db.add(point)
        else:
            # Remove points when uncompleting
            db.query(Point).filter(Point.chore_id == chore_id).delete()
    else:
        # INDIVIDUAL CHORE: Toggle completion for current user only
        completed_ids = set()
        if chore.completed_by_ids:
            completed_ids = set(int(x) for x in chore.completed_by_ids.split(",") if x.strip())
        
        user_id = current_user.id
        
        if user_id in completed_ids:
            # User is uncompleting their part
            completed_ids.discard(user_id)
            # Remove their points
            db.query(Point).filter(
                Point.chore_id == chore_id,
                Point.user_id == user_id
            ).delete()
        else:
            # User is completing their part
            completed_ids.add(user_id)
            # Award points to this user
            existing_point = db.query(Point).filter(
                Point.chore_id == chore_id,
                Point.user_id == user_id
            ).first()
            if not existing_point:
                point = Point(
                    user_id=user_id,
                    chore_id=chore_id,
                    points=chore.point_value,
                    awarded_at=datetime.utcnow(),
                )
                db.add(point)
        
        # Update completed_by_ids
        chore.completed_by_ids = ",".join(str(x) for x in sorted(completed_ids)) if completed_ids else None
        
        # Mark fully complete if all assignees have completed (or if unassigned)
        if assignee_ids:
            chore.completed = all(aid in completed_ids for aid in assignee_ids)
        else:
            chore.completed = len(completed_ids) > 0
    
    db.commit()
    db.refresh(chore)
    return chore


# Placeholder AI generation endpoint (to be wired with LangGraph)
@router.get("/generate", response_model=List[ChoreOut])
def generate_ai_chores(
    family_id: int,
    week_start: date,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Dev mock: return a few suggested chores.
    Replace with LangGraph pipeline in app/ai/chore_graph.py later.
    """
    # Check if user belongs to the family
    if current_user.family_id != family_id:
        raise HTTPException(status_code=403, detail="Access denied")
    suggestions = [
        Chore(
            family_id=family_id,
            title="Clean Room",
            description="Tidy up toys and make bed",
            emoji="🧹",
            point_value=5,
            assigned_to=None,
            completed=False,
            week_start=week_start,
            created_at=datetime.utcnow(),
        ),
        Chore(
            family_id=family_id,
            title="Feed Pet",
            description="Feed the dog breakfast",
            emoji="🐶",
            point_value=2,
            assigned_to=None,
            completed=False,
            week_start=week_start,
            created_at=datetime.utcnow(),
        ),
    ]
    # Do not persist in mock mode; just return models converted to schema
    return [
        ChoreOut(
            id=0,
            family_id=c.family_id,
            title=c.title,
            description=c.description,
            emoji=c.emoji,
            point_value=c.point_value,
            assigned_to=c.assigned_to,
            completed=c.completed,
            week_start=c.week_start,
            created_at=c.created_at,
        )
        for c in suggestions
    ]