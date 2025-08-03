from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List
from datetime import datetime

from ..db.session import get_db
from ..models.models import Point, User, Chore
from ..schemas.schemas import PointCreate, PointOut

router = APIRouter()


@router.get("/", response_model=List[PointOut])
def list_points(db: Session = Depends(get_db)):
    return db.execute(select(Point)).scalars().all()


@router.post("/", response_model=PointOut)
def add_points(payload: PointCreate, db: Session = Depends(get_db)):
    # Basic validation
    user = db.get(User, payload.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if payload.chore_id:
        chore = db.get(Chore, payload.chore_id)
        if not chore:
            raise HTTPException(status_code=404, detail="Chore not found")

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