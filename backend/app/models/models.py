from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime
from ..db.session import Base


class FamilyGroup(Base):
    __tablename__ = "family_groups"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    admin_password_hash: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    users: Mapped[list["User"]] = relationship("User", back_populates="family", cascade="all, delete-orphan")
    events: Mapped[list["Event"]] = relationship("Event", back_populates="family", cascade="all, delete-orphan")
    chores: Mapped[list["Chore"]] = relationship("Chore", back_populates="family", cascade="all, delete-orphan")
    goals: Mapped[list["Goal"]] = relationship("Goal", back_populates="family", cascade="all, delete-orphan")
    tokens: Mapped[list["CalendarToken"]] = relationship("CalendarToken", back_populates="family", cascade="all, delete-orphan")


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    family_id: Mapped[int | None] = mapped_column(ForeignKey("family_groups.id"))
    name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str | None] = mapped_column(String, unique=True)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[str] = mapped_column(String, nullable=False)  # parent | child
    profile_image_url: Mapped[str | None] = mapped_column(Text)
    icon_emoji: Mapped[str | None] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    family: Mapped["FamilyGroup"] = relationship("FamilyGroup", back_populates="users")
    events: Mapped[list["EventParticipant"]] = relationship("EventParticipant", back_populates="user", cascade="all, delete-orphan")
    chores_assigned: Mapped[list["Chore"]] = relationship("Chore", back_populates="assignee")
    points: Mapped[list["Point"]] = relationship("Point", back_populates="user")


class Event(Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    family_id: Mapped[int] = mapped_column(ForeignKey("family_groups.id"))
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    emoji: Mapped[str | None] = mapped_column(String)
    start_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    end_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    source: Mapped[str | None] = mapped_column(String)  # ical | google | alexa | manual
    source_id: Mapped[str | None] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    family: Mapped["FamilyGroup"] = relationship("FamilyGroup", back_populates="events")
    participants: Mapped[list["EventParticipant"]] = relationship(
        "EventParticipant", back_populates="event", cascade="all, delete-orphan"
    )


class EventParticipant(Base):
    __tablename__ = "event_participants"

    event_id: Mapped[int] = mapped_column(ForeignKey("events.id"), primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)

    event: Mapped["Event"] = relationship("Event", back_populates="participants")
    user: Mapped["User"] = relationship("User", back_populates="events")


class Chore(Base):
    __tablename__ = "chores"
    __table_args__ = (
        CheckConstraint("point_value BETWEEN 1 AND 10", name="chk_chore_points_between_1_10"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    family_id: Mapped[int] = mapped_column(ForeignKey("family_groups.id"))
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    emoji: Mapped[str | None] = mapped_column(String)
    point_value: Mapped[int] = mapped_column(Integer, nullable=False)
    assigned_to: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    week_start: Mapped[datetime] = mapped_column(Date, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    family: Mapped["FamilyGroup"] = relationship("FamilyGroup", back_populates="chores")
    assignee: Mapped["User"] = relationship("User", back_populates="chores_assigned")
    points: Mapped[list["Point"]] = relationship("Point", back_populates="chore")


class Point(Base):
    __tablename__ = "points"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    chore_id: Mapped[int | None] = mapped_column(ForeignKey("chores.id"))
    points: Mapped[int] = mapped_column(Integer, nullable=False)
    awarded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="points")
    chore: Mapped["Chore"] = relationship("Chore", back_populates="points")


class Goal(Base):
    __tablename__ = "goals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    family_id: Mapped[int] = mapped_column(ForeignKey("family_groups.id"))
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    point_requirement: Mapped[int | None] = mapped_column(Integer)
    prize: Mapped[str | None] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    family: Mapped["FamilyGroup"] = relationship("FamilyGroup", back_populates="goals")


class CalendarToken(Base):
    __tablename__ = "calendar_tokens"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    family_id: Mapped[int] = mapped_column(ForeignKey("family_groups.id"))
    service: Mapped[str] = mapped_column(String)  # google | alexa
    access_token: Mapped[str | None] = mapped_column(Text)
    refresh_token: Mapped[str | None] = mapped_column(Text)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    family: Mapped["FamilyGroup"] = relationship("FamilyGroup", back_populates="tokens")