from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from typing import List
from datetime import datetime

from ..db.session import get_db
from ..models.models import Point, User, Chore
from ..schemas.schemas import PointCreate, PointOut, LeaderboardEntry, CompletedChoreOut
from .auth import get_current_user

router = APIRouter()


@router.get("/", response_model=List[PointOut])
def list_points(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List points for the user's family. Requires authentication."""
    if not current_user.family_id:
        return []
    # Get points for users in the same family
    family_users = db.execute(select(User.id).where(User.family_id == current_user.family_id)).scalars().all()
    return db.execute(select(Point).where(Point.user_id.in_(family_users))).scalars().all()


@router.post("/", response_model=PointOut)
def add_points(
    payload: PointCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add points. Requires authentication and family membership."""
    # Basic validation
    user = db.get(User, payload.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if user belongs to the same family
    if user.family_id != current_user.family_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if payload.chore_id:
        chore = db.get(Chore, payload.chore_id)
        if not chore:
            raise HTTPException(status_code=404, detail="Chore not found")
        # Check if chore belongs to the same family
        if chore.family_id != current_user.family_id:
            raise HTTPException(status_code=403, detail="Access denied")

    p = Point(
        user_id=payload.user_id,
        chore_id=payload.chore_id,
        points=payload.points,
        awarded_at=datetime.utcnow(),
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


@router.get("/leaderboard", response_model=List[LeaderboardEntry])
def get_leaderboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get leaderboard with users' total points and completed chores.
    Returns users sorted by total points (descending).
    Requires authentication and returns only users from the same family.
    """
    if not current_user.family_id:
        return []
    
    # Get all users in the same family with their total points
    users_with_points = (
        db.query(
            User.id,
            User.name,
            User.icon_emoji,
            func.coalesce(func.sum(Point.points), 0).label("total_points"),
        )
        .outerjoin(Point, User.id == Point.user_id)
        .filter(User.family_id == current_user.family_id)
        .group_by(User.id, User.name, User.icon_emoji)
        .order_by(func.coalesce(func.sum(Point.points), 0).desc())
        .all()
    )

    leaderboard = []
    for user_id, name, icon_emoji, total_points in users_with_points:
        # Get all completed chores for this user (points with chore_id)
        points_with_chores = (
            db.query(Point, Chore)
            .join(Chore, Point.chore_id == Chore.id)
            .filter(Point.user_id == user_id)
            .order_by(Point.awarded_at.desc())
            .all()
        )

        completed_chores = [
            CompletedChoreOut(
                id=point.id,  # Use Point.id for unique keys (same chore can be completed multiple times)
                title=chore.title,
                emoji=chore.emoji,
                point_value=point.points,
                awarded_at=point.awarded_at,
            )
            for point, chore in points_with_chores
        ]

        leaderboard.append(
            LeaderboardEntry(
                user_id=user_id,
                name=name,
                icon_emoji=icon_emoji,
                total_points=int(total_points),
                completed_chores=completed_chores,
            )
        )

    return leaderboard