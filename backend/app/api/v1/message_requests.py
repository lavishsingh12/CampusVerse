from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.dependencies import get_current_user_id
from app.core.premium import is_user_premium
from app.db.session import get_db

from app.models.match import Match
from app.models.message import Message
from app.models.message_request import MessageRequest
from app.models.user import User

from app.schemas.message import MessageResponse
from app.schemas.message_request import (
    MessageRequestCreate,
    MessageRequestReply,
    MessageRequestResponse,
    ReceivedMessageRequestResponse,
)


router = APIRouter(
    prefix="/message-requests",
    tags=["Message Requests"],
)


# ---------------------------------------------------------
# CREATE MESSAGE REQUEST
# ---------------------------------------------------------

@router.post(
    "",
    response_model=MessageRequestResponse,
    status_code=201,
)
async def create_message_request(
    request_data: MessageRequestCreate,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    receiver_id = request_data.receiver_id
    content = request_data.content.strip()

    # Cannot send request to yourself
    if receiver_id == user_id:
        raise HTTPException(
            status_code=400,
            detail="You cannot send a message request to yourself",
        )

    # Message cannot be empty
    if not content:
        raise HTTPException(
            status_code=400,
            detail="Message request cannot be empty",
        )

    # Check sender
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    sender = result.scalar_one_or_none()

    if not sender:
        raise HTTPException(
            status_code=404,
            detail="Sender not found",
        )

    # Check receiver
    result = await db.execute(
        select(User).where(
            User.id == receiver_id,
            User.is_active.is_(True),
        )
    )
    receiver = result.scalar_one_or_none()

    if not receiver:
        raise HTTPException(
            status_code=404,
            detail="Receiver not found or inactive",
        )

    # -----------------------------------------------------
    # Check if already matched
    # -----------------------------------------------------

    user_one_id = min(user_id, receiver_id)
    user_two_id = max(user_id, receiver_id)

    result = await db.execute(
        select(Match).where(
            Match.user_one_id == user_one_id,
            Match.user_two_id == user_two_id,
        )
    )

    existing_match = result.scalar_one_or_none()

    if existing_match:
        raise HTTPException(
            status_code=400,
            detail="You are already matched with this user. Send a normal message instead.",
        )

    # -----------------------------------------------------
    # Check existing message request
    # -----------------------------------------------------

    result = await db.execute(
        select(MessageRequest).where(
            or_(
                (
                    (MessageRequest.sender_id == user_id)
                    & (MessageRequest.receiver_id == receiver_id)
                ),
                (
                    (MessageRequest.sender_id == receiver_id)
                    & (MessageRequest.receiver_id == user_id)
                ),
            )
        )
    )

    existing_request = result.scalar_one_or_none()

    if existing_request:
        if existing_request.status == "pending":
            raise HTTPException(
                status_code=409,
                detail="A message request is already pending between these users.",
            )

        raise HTTPException(
            status_code=409,
            detail="A message request between these users has already been handled.",
        )

    # -----------------------------------------------------
    # Message request limit
    # -----------------------------------------------------

    if not is_user_premium(sender):
        week_ago = datetime.now(timezone.utc) - timedelta(days=7)

        result = await db.execute(
            select(MessageRequest).where(
                MessageRequest.sender_id == user_id,
                MessageRequest.created_at >= week_ago,
                MessageRequest.status.in_(["pending", "accepted"]),
            )
        )

        request_count = len(result.scalars().all())

        if request_count >= settings.FREE_WEEKLY_MESSAGE_REQUESTS:
            raise HTTPException(
                status_code=429,
                detail="Weekly message request limit reached",
            )

    # -----------------------------------------------------
    # Create request
    # -----------------------------------------------------

    message_request = MessageRequest(
        sender_id=user_id,
        receiver_id=receiver_id,
        content=content,
        status="pending",
    )

    db.add(message_request)

    await db.commit()
    await db.refresh(message_request)

    return message_request


# ---------------------------------------------------------
# GET RECEIVED MESSAGE REQUESTS
# ---------------------------------------------------------

@router.get(
    "/received",
    response_model=list[ReceivedMessageRequestResponse],
)
async def get_received_message_requests(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    result = await db.execute(
        select(MessageRequest)
        .options(selectinload(MessageRequest.sender))
        .where(
            MessageRequest.receiver_id == user_id,
            MessageRequest.status == "pending",
        )
        .order_by(MessageRequest.created_at.desc())
    )

    return result.scalars().all()


# ---------------------------------------------------------
# ACCEPT MESSAGE REQUEST
# ---------------------------------------------------------

@router.post(
    "/{request_id}/accept",
    response_model=MessageRequestResponse,
)
async def accept_message_request(
    request_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    result = await db.execute(
        select(MessageRequest).where(
            MessageRequest.id == request_id,
            MessageRequest.receiver_id == user_id,
            MessageRequest.status == "pending",
        )
    )

    message_request = result.scalar_one_or_none()

    if not message_request:
        raise HTTPException(
            status_code=404,
            detail="Pending message request not found",
        )

    sender_id = message_request.sender_id
    receiver_id = message_request.receiver_id

    user_one_id = min(sender_id, receiver_id)
    user_two_id = max(sender_id, receiver_id)

    # Check whether match already exists
    result = await db.execute(
        select(Match).where(
            Match.user_one_id == user_one_id,
            Match.user_two_id == user_two_id,
        )
    )

    existing_match = result.scalar_one_or_none()

    # Create match if needed
    if not existing_match:
        match = Match(
            user_one_id=user_one_id,
            user_two_id=user_two_id,
        )

        db.add(match)

    # Accept request
    message_request.status = "accepted"

    await db.commit()
    await db.refresh(message_request)

    return message_request


# ---------------------------------------------------------
# DECLINE MESSAGE REQUEST
# ---------------------------------------------------------

@router.post(
    "/{request_id}/decline",
    response_model=MessageRequestResponse,
)
async def decline_message_request(
    request_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    result = await db.execute(
        select(MessageRequest).where(
            MessageRequest.id == request_id,
            MessageRequest.receiver_id == user_id,
            MessageRequest.status == "pending",
        )
    )

    message_request = result.scalar_one_or_none()

    if not message_request:
        raise HTTPException(
            status_code=404,
            detail="Pending message request not found",
        )

    message_request.status = "rejected"

    await db.commit()
    await db.refresh(message_request)

    return message_request


# ---------------------------------------------------------
# REPLY TO MESSAGE REQUEST
# ---------------------------------------------------------

@router.post(
    "/{request_id}/reply",
    response_model=MessageResponse,
)
async def reply_to_message_request(
    request_id: int,
    reply_data: MessageRequestReply,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    content = reply_data.content.strip()

    if not content:
        raise HTTPException(
            status_code=400,
            detail="Reply cannot be empty",
        )

    # -----------------------------------------------------
    # Find pending request
    # -----------------------------------------------------

    result = await db.execute(
        select(MessageRequest).where(
            MessageRequest.id == request_id,
            MessageRequest.receiver_id == user_id,
            MessageRequest.status == "pending",
        )
    )

    message_request = result.scalar_one_or_none()

    if not message_request:
        raise HTTPException(
            status_code=404,
            detail="Pending message request not found",
        )

    sender_id = message_request.sender_id
    receiver_id = message_request.receiver_id

    user_one_id = min(sender_id, receiver_id)
    user_two_id = max(sender_id, receiver_id)

    # -----------------------------------------------------
    # Find existing match
    # -----------------------------------------------------

    result = await db.execute(
        select(Match).where(
            Match.user_one_id == user_one_id,
            Match.user_two_id == user_two_id,
        )
    )

    match = result.scalar_one_or_none()

    # -----------------------------------------------------
    # Create match if it doesn't exist
    # -----------------------------------------------------

    if not match:
        match = Match(
            user_one_id=user_one_id,
            user_two_id=user_two_id,
        )

        db.add(match)

        # Get generated match ID
        await db.flush()

    # -----------------------------------------------------
    # Request becomes accepted
    # -----------------------------------------------------

    message_request.status = "accepted"

    # -----------------------------------------------------
    # Create normal message
    # -----------------------------------------------------

    message = Message(
        match_id=match.id,
        sender_id=user_id,
        content=content,
    )

    db.add(message)

    await db.commit()
    await db.refresh(message)

    return message