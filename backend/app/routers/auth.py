from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
import os
import secrets

from ..db.session import get_db
from ..models.models import User, FamilyGroup
from ..schemas.schemas import Token, LoginRequest, AdminLoginRequest

router = APIRouter()


def _issue_token(subject: str) -> Token:
    # Dev token generator (placeholder). Replace with JWT (e.g., pyjwt).
    token = secrets.token_urlsafe(32)
    return Token(access_token=f"dev.{subject}.{token}")


@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.execute(select(User).where(User.email == payload.email)).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    # TODO: verify password hash
    return _issue_token(subject=f"user:{user.id}")


@router.post("/admin-login", response_model=Token)
def admin_login(payload: AdminLoginRequest, db: Session = Depends(get_db)):
    fam = db.get(FamilyGroup, payload.family_id)
    if not fam:
        raise HTTPException(status_code=404, detail="Family not found")
    # TODO: verify admin_password against hashed admin_password_hash
    return _issue_token(subject=f"family-admin:{fam.id}")