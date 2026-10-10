from typing import Literal

from pydantic import BaseModel, ConfigDict


class ProfileActionCreate(BaseModel):
    target_profile_id: int
    action: Literal["like", "pass"]


class ProfileActionResponse(BaseModel):
    id: int
    user_id: int
    target_profile_id: int
    action: str
    match_created: bool = False

    model_config = ConfigDict(from_attributes=True)

