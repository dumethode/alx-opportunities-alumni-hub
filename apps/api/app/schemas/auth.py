from pydantic import BaseModel, EmailStr


class RegisterPayload(BaseModel):
    email: EmailStr
    password: str
    full_name: str


class LoginPayload(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    user: dict

