from pydantic import BaseModel, ConfigDict, Field


class UserBase(BaseModel):
    email: str
    name: str


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=72)


class UserResponse(UserBase):
    id: int
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
