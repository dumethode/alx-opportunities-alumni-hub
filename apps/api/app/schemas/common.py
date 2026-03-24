from datetime import datetime

from pydantic import BaseModel


class MessageResponse(BaseModel):
    message: str


class CountResponse(BaseModel):
    count: int


class BaseTimestamped(BaseModel):
    created_at: datetime | None = None

