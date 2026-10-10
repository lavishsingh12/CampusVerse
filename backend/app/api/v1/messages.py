from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user_id
from app.db.session import get_db
from app.models.match import Match
from app.models.message import Message
from app.schemas.message import MessageCreate, MessageResponse

router = APIRouter(prefix="/matches/{match_id}/messages", tags=["Messages"])


async def get_user_match(
    match_id: int,
    user_id: int,
    db: AsyncSession,
):
    result = await db.execute(
        select(Match).where(
            Match.id == match_id,
            (Match.user_one_id == user_id) | (Match.user_two_id == user_id),
        )
    )

    match = result.scalar_one_or_none()

    if not match:
        raise HTTPException(
            status_code=404,
            detail="Match not found",
        )

    return match


@router.post("", response_model=MessageResponse, status_code=201)
async def send_message(
    match_id: int,
    message_data: MessageCreate,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    await get_user_match(match_id, user_id, db)

    content = message_data.content.strip()

    if not content:
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty",
        )

    message = Message(
        match_id=match_id,
        sender_id=user_id,
        content=content,
    )

    db.add(message)
    await db.commit()
    await db.refresh(message)

    return message


@router.get("", response_model=list[MessageResponse])
async def get_messages(
    match_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    await get_user_match(match_id, user_id, db)

    result = await db.execute(
        select(Message)
        .where(Message.match_id == match_id)
        .order_by(Message.created_at.asc())
    )

    return result.scalars().all()
