from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect, text

from app.api.router import api_router
from app.core.config import settings
from app.core.database import Base, engine, session_scope
from app.seeds.seed import seed_database


uploads_dir = Path(settings.uploads_dir)
try:
    uploads_dir.mkdir(exist_ok=True)
    (uploads_dir / "avatars").mkdir(exist_ok=True)
    (uploads_dir / "opportunities").mkdir(exist_ok=True)
except OSError:
    pass


app = FastAPI(
    title="ALX Opportunities & Alumni Hub API",
    version="1.0.0",
    description="Backend API for the ALX opportunities and alumni community platform.",
)


# IMPORTANT: this must be registered BEFORE add_middleware(CORSMiddleware).
# Starlette's add_middleware inserts at index 0 each time, so the LAST
# registered middleware becomes the outermost layer. By registering this
# error-catcher first and CORS second, CORS ends up wrapping this middleware,
# so error responses produced here flow back through CORS and receive the
# Access-Control-Allow-Origin header. Without this, unhandled exceptions
# bubble all the way out to ServerErrorMiddleware (outermost of all), which
# returns a 500 with no CORS headers and the browser reports a CORS block.
@app.middleware("http")
async def catch_all_exceptions(request: Request, call_next):
    try:
        return await call_next(request)
    except HTTPException as exc:
        # BaseHTTPMiddleware can surface HTTPExceptions that ExceptionMiddleware
        # already processed - return them as proper responses so they flow
        # through CORSMiddleware and keep their correct status codes (401/403/404).
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
        )
    except Exception:
        return JSONResponse(
            status_code=500,
            content={"detail": "An unexpected error occurred. Please try again."},
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


if uploads_dir.exists():
    app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")
app.include_router(api_router, prefix="/api/v1")
