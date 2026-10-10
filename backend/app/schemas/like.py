from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.schemas.profile_photo import ProfilePhotoResponse


class LikeProfileSummary(BaseModel):
    id: int
    user_id: int
    display_name: str
    age: int
    degree: str
    year: str
    branch: str
    bio: str | None = None
    is_verified: bool
    photos: list[ProfilePhotoResponse] = []

    model_config = ConfigDict(from_attributes=True)


class LikeItemResponse(BaseModel):
    id: int
    created_at: datetime
    profile: LikeProfileSummary

    model_config = ConfigDict(from_attributes=True)
