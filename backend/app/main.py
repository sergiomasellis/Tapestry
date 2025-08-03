from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import auth, users, families, calendars, chores, points, goals

app = FastAPI(
    title="Tapestry API",
    version="0.1.0",
    description="Family calendar, chores, and rewards API",
)

# CORS - allow local frontend during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root health
@app.get("/healthz")
def health():
    return {"status": "ok"}

# Routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(families.router, prefix="/api/families", tags=["families"])
app.include_router(calendars.router, prefix="/api/calendars", tags=["calendars"])
app.include_router(chores.router, prefix="/api/chores", tags=["chores"])
app.include_router(points.router, prefix="/api/points", tags=["points"])
app.include_router(goals.router, prefix="/api/goals", tags=["goals"])