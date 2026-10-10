from fastapi import APIRouter, Depends
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.dependencies import get_current_user_id
from app.db.session import get_db
from app.models.match import Match
from app.models.message import Message
from app.models.profile import Profile
from app.models.user import User
from app.schemas.match import (
    MatchLastMessage,
    MatchProfileSummary,
    MatchResponse,
    MatchUserResponse,
)

router = APIRouter(prefix="/matches", tags=["Matches"])


@router.get("", response_model=list[MatchResponse])
async def get_my_matches(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    result = await db.execute(
        select(Match).where(
            or_(
                Match.user_one_id == user_id,
                Match.user_two_id == user_id,
            )
        )
    )

    matches = result.scalars().all()

    response = []

    for match in matches:
        other_user_id = (
            match.user_two_id
            if match.user_one_id == user_id
            else match.user_one_id
        )

        user_result = await db.execute(
            select(User)
            .options(
                selectinload(User.profile).selectinload(Profile.photos)
            )
            .where(User.id == other_user_id)
        )
        other_user = user_result.scalar_one_or_none()
        if not other_user:
            continue

        profile_summary = None
        if other_user.profile:
            photos = sorted(
                other_user.profile.photos or [],
                key=lambda p: p.position,
            )
            first_photo = photos[0].url if photos else None

            profile_summary = MatchProfileSummary(
                display_name=other_user.profile.display_name,
                avatar=first_photo,
                degree=other_user.profile.degree,
                year=other_user.profile.year,
                branch=other_user.profile.branch,
            )

        # Get latest message for this match if any
        latest_msg_result = await db.execute(
            select(Message)
            .where(Message.match_id == match.id)
            .order_by(Message.created_at.desc())
            .limit(1)
        )
        latest_msg = latest_msg_result.scalar_one_or_none()
        last_message_summary = (
            MatchLastMessage(
                id=latest_msg.id,
                sender_id=latest_msg.sender_id,
                content=latest_msg.content,
                created_at=latest_msg.created_at,
            )
            if latest_msg
            else None
        )

        user_summary = MatchUserResponse(
            id=other_user.id,
            name=other_user.name,
            email=other_user.email,
            profile=profile_summary,
        )

        response.append(
            MatchResponse(
                id=match.id,
                user=user_summary,
                last_message=last_message_summary,
            )
        )

    return response

