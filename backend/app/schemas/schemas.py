from datetime import datetime, date
from typing import Literal, Optional, List
from pydantic import BaseModel, EmailStr


# Common
class Message(BaseModel):
    message: str


# Users
class UserBase(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    role: Literal["parent", "child"]
    profile_image_url: Optional[str] = None
    icon_emoji: Optional[str] = None


class UserCreate(UserBase):
    password: str
    family_id: Optional[int] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    profile_image_url: Optional[str] = None
    icon_emoji: Optional[str] = None


class UserOut(UserBase):
    id: int
    family_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Families
class FamilyCreate(BaseModel):
    name: str
    admin_password: str


class FamilyInvite(BaseModel):
    email: EmailStr


class FamilyOut(BaseModel):
    id: int
    name: str
    created_at: datetime

    class Config:
        from_attributes = True


# Auth
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AdminLoginRequest(BaseModel):
    family_id: int
    admin_password: str


# Events
class EventBase(BaseModel):
    family_id: int
    title: str
    description: Optional[str] = None
    emoji: Optional[str] = None
    start_time: datetime
    end_time: datetime
    source: Optional[Literal["ical", "google", "alexa", "manual"]] = None
    source_id: Optional[str] = None


class EventCreate(EventBase):
    pass


class EventOut(EventBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Chores
class ChoreBase(BaseModel):
    family_id: int
    title: str
    description: Optional[str] = None
    emoji: Optional[str] = None
    point_value: int
    assigned_to: Optional[int] = None
    completed: bool = False
    week_start: date


class ChoreCreate(ChoreBase):
    pass


class ChoreUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    emoji: Optional[str] = None
    point_value: Optional[int] = None
    assigned_to: Optional[int] = None
    completed: Optional[bool] = None


class ChoreOut(ChoreBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Points
class PointCreate(BaseModel):
    user_id: int
    chore_id: Optional[int] = None
    points: int


class PointOut(PointCreate):
    id: int
    awarded_at: datetime

    class Config:
        from_attributes = True


# Goals
class GoalBase(BaseModel):
    family_id: int
    name: str
    description: Optional[str] = None
    point_requirement: Optional[int] = None
    prize: Optional[str] = None


class GoalCreate(GoalBase):
    pass


class GoalUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    point_requirement: Optional[int] = None
    prize: Optional[str] = None


class GoalOut(GoalBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Calendars
class ICalConnectRequest(BaseModel):
    url: str


class GoogleConnectRequest(BaseModel):
    code: str  # OAuth authorization code (placeholder for dev)


class AlexaConnectRequest(BaseModel):
    token: str  # placeholder for dev


class WeeklyEventsOut(BaseModel):
    events: List[EventOut]