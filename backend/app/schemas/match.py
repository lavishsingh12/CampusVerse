from datetime import datetime
from pydantic import BaseModel, ConfigDict


class MatchProfileSummary(BaseModel):
    display_name: str | None = None
    avatar: str | None = None
    degree: str | None = None
    year: str | None = None
    branch: str | None = None

    model_config = ConfigDict(from_attributes=True)


class MatchLastMessage(BaseModel):
    id: int
    sender_id: int
    content: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MatchUserResponse(BaseModel):
    id: int
    name: str
    email: str
    profile: MatchProfileSummary | None = None

    model_config = ConfigDict(from_attributes=True)


class MatchResponse(BaseModel):
    id: int
    user: MatchUserResponse
    last_message: MatchLastMessage | None = None

    model_config = ConfigDict(from_attributes=True)

