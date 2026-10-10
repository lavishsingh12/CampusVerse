from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.dependencies import get_current_user_id
from app.core.premium import is_user_premium
from app.db.session import get_db
from app.models.profile_action import ProfileAction
from app.models.user import User

router = APIRouter(prefix="/rewind", tags=["Rewind"])


@router.post("")
async def rewind_last_action(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    # Find the user's most recent like/pass action
    result = await db.execute(
        select(ProfileAction)
        .where(
            ProfileAction.user_id == user_id,
            ProfileAction.action.in_(["like", "pass"]),
        )
        .order_by(ProfileAction.created_at.desc())
    )

    last_action = result.scalars().first()

    if not last_action:
        raise HTTPException(
            status_code=400,
            detail="Nothing to rewind",
        )

    # Free users get 1 rewind per day.
    # Premium users have unlimited rewinds.
    if not is_user_premium(user):
        now = datetime.now(timezone.utc)
        start_of_day = now.replace(
            hour=0,
            minute=0,
            second=0,
            microsecond=0,
        )

        result = await db.execute(
            select(ProfileAction).where(
                ProfileAction.user_id == user_id,
                ProfileAction.action == "rewind",
                ProfileAction.created_at >= start_of_day,
            )
        )

        rewind_count = len(result.scalars().all())

        if rewind_count >= settings.FREE_DAILY_REWINDS:
            raise HTTPException(
                status_code=429,
                detail="Daily rewind limit reached",
            )

    # Restore the last profile action by removing it.
    await db.delete(last_action)

    # Track the rewind.
    rewind = ProfileAction(
        user_id=user_id,
        target_profile_id=last_action.target_profile_id,
        action="rewind",
    )

    db.add(rewind)

    await db.commit()

    return {
        "message": "Last action rewound successfully",
        "profile_id": last_action.target_profile_id,
    }
