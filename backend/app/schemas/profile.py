from pydantic import BaseModel, ConfigDict, Field
from app.schemas.profile_photo import ProfilePhotoResponse


class InterestItem(BaseModel):
    id: str = Field(min_length=1, max_length=64)
    label: str = Field(min_length=1, max_length=24)
    emoji: str = Field(min_length=1, max_length=16)


class IcebreakerItem(BaseModel):
    prompt: str = Field(min_length=1, max_length=64)
    text: str = Field(min_length=1, max_length=150)


class ProfileBase(BaseModel):
    display_name: str = Field(min_length=1, max_length=100)
    age: int = Field(ge=17, le=35)
    degree: str = Field(min_length=1, max_length=100)
    year: str = Field(min_length=1, max_length=50)
    branch: str = Field(min_length=1, max_length=150)
    bio: str | None = Field(default=None, max_length=140)
    university: str | None = Field(default=None, max_length=150)
    campus: str | None = Field(default=None, max_length=150)
    lifestyle: dict[str, str] | None = None
    interests: list[InterestItem] | None = Field(
        default=None, min_length=3, max_length=10
    )
    icebreakers: list[IcebreakerItem] | None = Field(default=None, max_length=3)


class ProfileCreate(ProfileBase):
    user_id: int


class ProfileUpdate(BaseModel):
    display_name: str | None = Field(default=None, min_length=1, max_length=100)
    age: int | None = Field(default=None, ge=17, le=35)
    degree: str | None = Field(default=None, min_length=1, max_length=100)
    year: str | None = Field(default=None, min_length=1, max_length=50)
    branch: str | None = Field(default=None, min_length=1, max_length=150)
    bio: str | None = Field(default=None, max_length=140)
    university: str | None = Field(default=None, max_length=150)
    campus: str | None = Field(default=None, max_length=150)
    lifestyle: dict[str, str] | None = None
    interests: list[InterestItem] | None = Field(
        default=None, min_length=3, max_length=10
    )
    icebreakers: list[IcebreakerItem] | None = Field(default=None, max_length=3)


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
