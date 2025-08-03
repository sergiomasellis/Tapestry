# Tapestry Backend (FastAPI + SQLAlchemy + LangGraph)

Stack
- FastAPI (HTTP API)
- SQLAlchemy 2.0 (ORM)
- SQLite (development)
- Pydantic v2 (schemas)
- LangGraph (AI chore generation/point assignment pipeline)
- python-dotenv (env loading)
- uv (project/env manager)
- ruff (lint)

Quick Start
1) Enter backend dir and create/update venv with uv:
   uv sync

2) Create a local env file:
   cp .env.example .env
   # update values as needed

3) Initialize the database (auto-creates SQLite and tables on first run).

4) Run dev server:
   uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

5) Open docs:
   http://localhost:8000/docs

Environment
- .env
  DATABASE_URL=sqlite:///./data.db
  SECRET_KEY=dev-secret-change
  ACCESS_TOKEN_EXPIRE_MINUTES=60

API Overview (per PRD)
- Users: CRUD
- Families: create, invite
- Auth: login, admin-login (master password)
- Calendars: list, add iCal, connect Google, connect Alexa, sync
- Chores: list, create, update, delete, complete, generate (AI via LangGraph)
- Points: list, add
- Goals: list, create, update, delete

Directory
- app/
  - main.py (FastAPI app, router includes)
  - db/
    - session.py (engine/session)
  - models/
    - models.py (SQLAlchemy tables)
  - schemas/
    - schemas.py (Pydantic models)
  - routers/
    - auth.py, users.py, families.py, calendars.py, chores.py, points.py, goals.py
  - ai/
    - chore_graph.py (LangGraph pipeline)

Notes
- This is a development scaffold with minimal implementations and mock behavior where external integrations are required.
- Replace mocks with real integrations incrementally (Google Calendar, Alexa Reminders, OAuth).