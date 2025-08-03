from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import datetime
from typing import List

from ..db.session import get_db
from ..models.models import FamilyGroup, User
from ..schemas.schemas import FamilyCreate, FamilyOut, FamilyInvite, Message

router = APIRouter()


@router.post("/", response_model=FamilyOut)
def create_family(payload: FamilyCreate, db: Session = Depends(get_db)):
    fam = FamilyGroup(
        name=payload.name,
        admin_password_hash=f"bcrypt$dev${payload.admin_password}",  # TODO: real hashing
        created_at=datetime.utcnow(),
    )
    db.add(fam)
    db.commit()
    db.refresh(fam)
    return fam


@router.get("/", response_model=List[FamilyOut])
def list_families(db: Session = Depends(get_db)):
    return db.execute(select(FamilyGroup)).scalars().all()


@router.post("/{family_id}/invite")
def invite_member(family_id: int, payload: FamilyInvite, db: Session = Depends(get_db)):
    fam = db.get(FamilyGroup, family_id)
    if not fam:
        raise HTTPException(status_code=404, detail="Family not found")
    # Dev mock: In production, send email or generate tokenized link
    return {"message": f"Invite sent to {payload.email}"}