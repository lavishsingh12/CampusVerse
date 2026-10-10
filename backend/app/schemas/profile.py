from pydantic import BaseModel, ConfigDict
from app.schemas.profile_photo import ProfilePhotoResponse


class ProfileBase(BaseModel):
    display_name: str
    age: int
    degree: str
    year: str
    branch: str
    bio: str | None = None


class ProfileCreate(ProfileBase):
    user_id: int


class ProfileUpdate(BaseModel):
    display_name: str | None = None
    age: int | None = None
    degree: str | None = None
    year: str | None = None
    branch: str | None = None
    bio: str | None = None


class ProfileResponse(ProfileBase):
    id: int
    user_id: int
    is_verified: bool
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class ProfileDetailResponse(ProfileResponse):
    email: str | None = None
    user_name: str | None = None
    is_premium: bool = False
    photos: list[ProfilePhotoResponse] = []

    model_config = ConfigDict(from_attributes=True)

