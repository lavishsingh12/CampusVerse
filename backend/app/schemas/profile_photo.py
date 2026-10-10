from pydantic import BaseModel, ConfigDict


class ProfilePhotoBase(BaseModel):
    url: str
    position: int


class ProfilePhotoCreate(ProfilePhotoBase):
    pass


class ProfilePhotoResponse(ProfilePhotoBase):
    id: int
    profile_id: int

    model_config = ConfigDict(from_attributes=True)


class PhotoOrderItem(BaseModel):
    photo_id: int
    position: int


class ReorderPhotosRequest(BaseModel):
    photos: list[PhotoOrderItem]


