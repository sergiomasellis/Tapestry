from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List
from datetime import datetime

from ..db.session import get_db
from ..models.models import Goal, User
from ..schemas.schemas import GoalCreate, GoalUpdate, GoalOut
from .auth import get_current_user

router = APIRouter()


@router.get("/", response_model=List[GoalOut])
def list_goals(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """List goals for the user's family. Requires authentication."""
    if not current_user.family_id:
        return []
    return (
        db.execute(select(Goal).where(Goal.family_id == current_user.family_id))
        .scalars()
        .all()
    )


@router.post("/", response_model=GoalOut)
def create_goal(
    payload: GoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a goal. Requires authentication and family membership."""
    if not current_user.family_id:
        raise HTTPException(status_code=400, detail="User must belong to a family")

    # Ensure goal belongs to user's family
    if payload.family_id != current_user.family_id:
        raise HTTPException(
            status_code=403, detail="Cannot create goal for different family"
        )

    goal = Goal(
        family_id=payload.family_id,
        name=payload.name,
        description=payload.description,
        point_requirement=payload.point_requirement,
        prize=payload.prize,
        created_at=datetime.utcnow(),
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


@router.put("/{goal_id}", response_model=GoalOut)
def update_goal(
    goal_id: int,
    payload: GoalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a goal. Requires authentication and family membership."""
    goal = db.get(Goal, goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    # Check if user belongs to the same family
    if current_user.family_id != goal.family_id:
        raise HTTPException(status_code=403, detail="Access denied")

    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(goal, k, v)
    db.commit()
    db.refresh(goal)
    return goal


@router.delete("/{goal_id}")
def delete_goal(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a goal. Requires authentication and family membership."""
    goal = db.get(Goal, goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    # Check if user belongs to the same family
    if current_user.family_id != goal.family_id:
        raise HTTPException(status_code=403, detail="Access denied")

    db.delete(goal)
    db.commit()
    return {"message": "deleted"}
