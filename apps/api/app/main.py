from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect, text

from app.api.router import api_router
from app.core.config import settings
from app.core.database import Base, engine, session_scope
from app.seeds.seed import seed_database


uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)
(uploads_dir / "avatars").mkdir(exist_ok=True)
(uploads_dir / "opportunities").mkdir(exist_ok=True)


app = FastAPI(
    title="ALX Opportunities & Alumni Hub API",
    version="1.0.0",
    description="Backend API for the ALX opportunities and alumni community platform.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def ensure_runtime_columns() -> None:
    inspector = inspect(engine)
    with engine.begin() as connection:
        if "profiles" in inspector.get_table_names():
            profile_columns = {column["name"] for column in inspector.get_columns("profiles")}
            if "skills_text" not in profile_columns:
                connection.execute(text("ALTER TABLE profiles ADD COLUMN skills_text TEXT"))
            if "interests_text" not in profile_columns:
                connection.execute(text("ALTER TABLE profiles ADD COLUMN interests_text TEXT"))
        if "opportunities" in inspector.get_table_names():
            opportunity_columns = {column["name"] for column in inspector.get_columns("opportunities")}
            if "image_url" not in opportunity_columns:
                connection.execute(text("ALTER TABLE opportunities ADD COLUMN image_url VARCHAR(255)"))
            if "deadline_label" not in opportunity_columns:
                connection.execute(text("ALTER TABLE opportunities ADD COLUMN deadline_label VARCHAR(80)"))


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    ensure_runtime_columns()
    with session_scope() as db:
        seed_database(db)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.include_router(api_router, prefix="/api/v1")
