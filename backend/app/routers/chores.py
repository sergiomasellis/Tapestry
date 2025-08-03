from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import date, datetime
from typing import List

from ..db.session import get_db, engine
from ..models.models import Chore, User
from ..schemas.schemas import ChoreCreate, ChoreOut, ChoreUpdate, Message

router = APIRouter()


@router.get("/", response_model=List[ChoreOut])
def list_chores(db: Session = Depends(get_db)):
    rows = db.execute(select(Chore)).scalars().all()
    return rows


@router.post("/", response_model=ChoreOut)
def create_chore(payload: ChoreCreate, db: Session = Depends(get_db)):
    if payload.point_value < 1 or payload.point_value > 10:
        raise HTTPException(status_code=400, detail="point_value must be 1..10")
    chore = Chore(
        family_id=payload.family_id,
        title=payload.title,
        description=payload.description,
        emoji=payload.emoji,
        point_value=payload.point_value,
        assigned_to=payload.assigned_to,
        completed=payload.completed,
        week_start=payload.week_start,
        created_at=datetime.utcnow(),
    )
    db.add(chore)
    db.commit()
    db.refresh(chore)
    return chore


@router.put("/{chore_id}", response_model=ChoreOut)
def update_chore(chore_id: int, payload: ChoreUpdate, db: Session = Depends(get_db)):
    chore = db.get(Chore, chore_id)
    if not chore:
        raise HTTPException(status_code=404, detail="Chore not found")
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
def delete_chore(chore_id: int, db: Session = Depends(get_db)):
    chore = db.get(Chore, chore_id)
    if not chore:
        raise HTTPException(status_code=404, detail="Chore not found")
    db.delete(chore)
    db.commit()
    return Message(message="deleted")


@router.post("/{chore_id}/complete", response_model=ChoreOut)
def complete_chore(chore_id: int, db: Session = Depends(get_db)):
    chore = db.get(Chore, chore_id)
    if not chore:
        raise HTTPException(status_code=404, detail="Chore not found")
    chore.completed = True
    db.commit()
    db.refresh(chore)
    return chore


# Placeholder AI generation endpoint (to be wired with LangGraph)
@router.get("/generate", response_model=List[ChoreOut])
def generate_ai_chores(family_id: int, week_start: date, db: Session = Depends(get_db)):
    """
    Dev mock: return a few suggested chores.
    Replace with LangGraph pipeline in app/ai/chore_graph.py later.
    """
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