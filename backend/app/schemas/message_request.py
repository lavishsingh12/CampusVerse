from datetime import datetime

from pydantic import BaseModel, ConfigDict


class MessageRequestCreate(BaseModel):
    receiver_id: int
    content: str


class MessageRequestAction(BaseModel):
    pass


class MessageRequestSender(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class MessageRequestResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ReceivedMessageRequestResponse(BaseModel):
    id: int
    sender_id: int
    sender: MessageRequestSender
    content: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class MessageRequestReply(BaseModel):
    content: str
