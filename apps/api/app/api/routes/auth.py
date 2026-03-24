from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.api.deps import DbDep, get_current_user
from app.core.config import settings
from app.core.security import create_token, hash_password, verify_password
from app.models.models import Profile, User
from app.schemas.auth import LoginPayload, RegisterPayload, TokenResponse


router = APIRouter()


def _auth_response(user: User, response: Response) -> TokenResponse:
    access_token = create_token(str(user.id), settings.access_token_expire_minutes, "access")
    refresh_token = create_token(str(user.id), settings.refresh_token_expire_minutes, "refresh")
    cookie_kwargs = {
        "httponly": True,
        "samesite": settings.cookie_samesite,
        "secure": settings.cookie_secure,
    }
    if settings.cookie_domain:
        cookie_kwargs["domain"] = settings.cookie_domain
    response.set_cookie("access_token", access_token, **cookie_kwargs)
    response.set_cookie("refresh_token", refresh_token, **cookie_kwargs)
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user={
            "id": user.id,
            "email": user.email,
            "role": user.role.value,
            "full_name": user.profile.full_name if user.profile else "",
        },
    )


@router.post("/register", response_model=TokenResponse)
def register(payload: RegisterPayload, response: Response, db: DbDep) -> TokenResponse:
    email = str(payload.email).lower()
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    user = User(email=email, password_hash=hash_password(payload.password))
    db.add(user)
    db.flush()
    db.add(Profile(user_id=user.id, full_name=payload.full_name))
    db.commit()
    db.refresh(user)
    return _auth_response(user, response)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginPayload, response: Response, db: DbDep) -> TokenResponse:
    email = str(payload.email).lower()
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    user.last_login_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return _auth_response(user, response)


@router.post("/logout")
def logout(response: Response) -> dict[str, str]:
    delete_kwargs = {"samesite": settings.cookie_samesite, "secure": settings.cookie_secure}
    if settings.cookie_domain:
        delete_kwargs["domain"] = settings.cookie_domain
    response.delete_cookie("access_token", **delete_kwargs)
    response.delete_cookie("refresh_token", **delete_kwargs)
    return {"message": "Logged out"}


@router.get("/me")
def me(current_user: User = Depends(get_current_user)) -> dict:
    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role.value,
        "profile": {
            "full_name": current_user.profile.full_name if current_user.profile else "",
            "headline": current_user.profile.headline if current_user.profile else None,
            "location": current_user.profile.location if current_user.profile else None,
            "bio": current_user.profile.bio if current_user.profile else None,
            "avatar_url": current_user.profile.avatar_url if current_user.profile else None,
            "linkedin_url": current_user.profile.linkedin_url if current_user.profile else None,
            "github_url": current_user.profile.github_url if current_user.profile else None,
            "portfolio_url": current_user.profile.portfolio_url if current_user.profile else None,
            "skills_text": current_user.profile.skills_text if current_user.profile else None,
            "interests_text": current_user.profile.interests_text if current_user.profile else None,
        },
    }
