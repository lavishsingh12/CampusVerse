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
    MessageRequestConversation,
)


router = APIRouter(
    prefix="/message-requests",
    tags=["Message Requests"],
)


def _normalize_pending_messages(request: MessageRequest) -> list[str]:
    messages = request.pending_messages or []
    if not isinstance(messages, list):
        return [request.content]
    return [str(message) for message in messages if message is not None]


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
        ).with_for_update()
    )

    existing_request = result.scalar_one_or_none()

    if existing_request:
        if existing_request.status == "pending":
            if existing_request.sender_id == user_id:
                detail = "You already sent this user a pending message request."
            else:
                detail = "This user already sent you a pending message request. Review it in Requests."
            raise HTTPException(
                status_code=409,
                detail=detail,
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
        pending_messages=[content],
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


@router.get("/conversations", response_model=list[MessageRequestConversation])
async def get_message_request_conversations(
    db: AsyncSession = Depends(get_db), user_id: int = Depends(get_current_user_id)
):
    result = await db.execute(
        select(MessageRequest)
        .options(selectinload(MessageRequest.sender), selectinload(MessageRequest.receiver))
        .where(
            MessageRequest.sender_id == user_id,
            MessageRequest.status == "pending",
        ).order_by(MessageRequest.created_at.desc())
    )
    return [{
        "id": request.id, "sender_id": request.sender_id, "receiver_id": request.receiver_id,
        "status": request.status, "content": request.content,
        "pending_messages": _normalize_pending_messages(request), "created_at": request.created_at,
        "other_user": request.receiver if request.sender_id == user_id else request.sender,
    } for request in result.scalars().all()]


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
        ).with_for_update()
    )

    message_request = result.scalar_one_or_none()

    if not message_request:
        raise HTTPException(
            status_code=404,
            detail="Message request not found",
        )

    if message_request.status == "accepted":
        return message_request

    if message_request.status != "pending":
        raise HTTPException(status_code=409, detail="Message request has already been handled")

    # A request acceptance creates the romantic conversation exactly once. The
    # unique pair constraint on Match is the persistence backstop for retries.
    pending_messages = _normalize_pending_messages(message_request)
    user_one_id = min(message_request.sender_id, message_request.receiver_id)
    user_two_id = max(message_request.sender_id, message_request.receiver_id)
    result = await db.execute(select(Match).where(
        Match.user_one_id == user_one_id, Match.user_two_id == user_two_id
    ))
    match = result.scalar_one_or_none()
    if match is None:
        match = Match(user_one_id=user_one_id, user_two_id=user_two_id)
        db.add(match)
        await db.flush()

    existing = await db.execute(select(Message).where(Message.match_id == match.id))
    existing_contents = {(item.sender_id, item.content) for item in existing.scalars().all()}

    # An earlier deployed request-conversation implementation may already have
    # stored messages under this request ID. Link them to the match instead of
    # dropping or duplicating that history.
    request_messages_result = await db.execute(select(Message).where(
        Message.message_request_id == message_request.id
    ).order_by(Message.created_at.asc()))
    for stored_message in request_messages_result.scalars().all():
        stored_message.match_id = match.id
        stored_message.message_request_id = None
        existing_contents.add((stored_message.sender_id, stored_message.content))
    for pending_message in pending_messages:
        if (message_request.sender_id, pending_message) not in existing_contents:
            db.add(Message(match_id=match.id, sender_id=message_request.sender_id, content=pending_message))
    message_request.status = "accepted"
    message_request.pending_messages = pending_messages

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

    if message_request.status in {"accepted", "rejected"}:
        return message_request

    message_request.status = "rejected"

    await db.commit()
    await db.refresh(message_request)

    return message_request


# ---------------------------------------------------------
# REPLY TO MESSAGE REQUEST
# ---------------------------------------------------------

@router.post(
    "/{request_id}/reply",
    response_model=MessageRequestResponse,
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
            MessageRequest.sender_id == user_id,
            MessageRequest.status == "pending",
        )
    )

    message_request = result.scalar_one_or_none()

    if not message_request:
        raise HTTPException(
            status_code=404,
            detail="Pending message request not found",
        )

    pending_messages = _normalize_pending_messages(message_request)
    if len(pending_messages) >= settings.PENDING_MESSAGE_REQUEST_LIMIT:
        raise HTTPException(
            status_code=429,
            detail="Pending message limit reached for this request.",
        )

    pending_messages.append(content)
    message_request.pending_messages = pending_messages

    await db.commit()
    await db.refresh(message_request)

    return message_request


async def _get_participant_request(request_id: int, user_id: int, db: AsyncSession) -> MessageRequest:
    result = await db.execute(select(MessageRequest).where(
        MessageRequest.id == request_id,
        or_(MessageRequest.sender_id == user_id, MessageRequest.receiver_id == user_id),
    ))
    request = result.scalar_one_or_none()
    if not request:
        raise HTTPException(status_code=404, detail="Message request not found")
    return request


@router.get("/{request_id}/messages", response_model=list[MessageResponse])
async def get_request_messages(request_id: int, db: AsyncSession = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    request = await _get_participant_request(request_id, user_id, db)
    if request.status == "rejected":
        raise HTTPException(status_code=404, detail="Message request not found")
    if request.status == "pending":
        # Pending messages are persisted on the request, including the initial one.
        return [Message(id=-(index + 1), match_id=None, message_request_id=request.id,
                        sender_id=request.sender_id, content=content, created_at=request.created_at)
                for index, content in enumerate(_normalize_pending_messages(request))]
    if request.status == "accepted":
        user_one_id = min(request.sender_id, request.receiver_id)
        user_two_id = max(request.sender_id, request.receiver_id)
        match = (await db.execute(select(Match).where(
            Match.user_one_id == user_one_id, Match.user_two_id == user_two_id
        ))).scalar_one_or_none()
        if not match:
            raise HTTPException(status_code=409, detail="Accepted request is missing its match conversation")
        result = await db.execute(select(Message).where(
            Message.match_id == match.id
        ).order_by(Message.created_at.asc()))
    else:
        result = await db.execute(select(Message).where(
            Message.message_request_id == request.id
        ).order_by(Message.created_at.asc()))
    return result.scalars().all()


@router.post("/{request_id}/messages", response_model=MessageResponse, status_code=201)
async def send_request_message(request_id: int, message_data: MessageRequestReply,
                               db: AsyncSession = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    request = await _get_participant_request(request_id, user_id, db)
    content = message_data.content.strip()
    if not content:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    if request.status == "pending":
        if request.sender_id != user_id:
            raise HTTPException(status_code=403, detail="Only the sender can add messages while a request is pending")
        pending_messages = _normalize_pending_messages(request)
        if len(pending_messages) >= settings.PENDING_MESSAGE_REQUEST_LIMIT:
            raise HTTPException(status_code=429, detail="Pending message limit reached for this request.")
        pending_messages.append(content)
        request.pending_messages = pending_messages
        await db.commit()
        await db.refresh(request)
        # A persisted request message has no messages-table row until acceptance.
        return Message(id=-len(pending_messages), match_id=None, message_request_id=request.id,
                       sender_id=user_id, content=content, created_at=request.created_at)
    if request.status != "accepted":
        raise HTTPException(status_code=409, detail="This conversation has not been accepted")
    user_one_id = min(request.sender_id, request.receiver_id)
    user_two_id = max(request.sender_id, request.receiver_id)
    match = (await db.execute(select(Match).where(
        Match.user_one_id == user_one_id, Match.user_two_id == user_two_id
    ))).scalar_one_or_none()
    if not match:
        raise HTTPException(status_code=409, detail="Accepted request is missing its match conversation")
    message = Message(match_id=match.id, message_request_id=None, sender_id=user_id, content=content)
    db.add(message)
    await db.commit()
    await db.refresh(message)
    return message
