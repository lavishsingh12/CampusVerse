from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import exists, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.dependencies import get_current_user_id
from app.db.session import get_db
from app.models.match import Match
from app.models.message_request import MessageRequest
from app.models.profile import Profile
from app.models.profile_action import ProfileAction
from app.schemas.profile import ProfileDetailResponse
from app.schemas.profile_photo import ProfilePhotoResponse


router = APIRouter(
    prefix="/discover",
    tags=["Discover"],
)


@router.get(
    "",
    response_model=list[ProfileDetailResponse],
)
async def get_discover_profiles(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    # ---------------------------------------------------------
    # Discover cooldown
    # ---------------------------------------------------------

    cooldown_time = datetime.now(timezone.utc) - timedelta(
        days=settings.DISCOVER_COOLDOWN_DAYS
    )

    # ---------------------------------------------------------
    # 1. Profiles that the user has LIKED
    #
    # Like stays hidden until rewind or match.
    # ---------------------------------------------------------

    liked_profiles = select(ProfileAction.target_profile_id).where(
        ProfileAction.user_id == user_id,
        ProfileAction.action == "like",
    )

    # ---------------------------------------------------------
    # 2. Profiles that the user has PASSED recently
    #
    # Pass is temporary and expires after cooldown.
    # ---------------------------------------------------------

    recently_passed_profiles = select(
        ProfileAction.target_profile_id
    ).where(
        ProfileAction.user_id == user_id,
        ProfileAction.action == "pass",
        ProfileAction.created_at >= cooldown_time,
    )

    # ---------------------------------------------------------
    # 3. Pending message requests
    #
    # If either side has sent a pending request, both users
    # should temporarily disappear from each other's Discover.
    # ---------------------------------------------------------

    pending_message_request_exists = exists(
        select(MessageRequest.id).where(
            MessageRequest.status == "pending",
            or_(
                (
                    (MessageRequest.sender_id == user_id)
                    & (MessageRequest.receiver_id == Profile.user_id)
                ),
                (
                    (MessageRequest.sender_id == Profile.user_id)
                    & (MessageRequest.receiver_id == user_id)
                ),
            ),
        )
    )

    # ---------------------------------------------------------
    # 4. Recently declined message requests
    #
    # Decline is temporary. After the cooldown expires,
    # the profile can appear again.
    # ---------------------------------------------------------

    recently_declined_request_exists = exists(
        select(MessageRequest.id).where(
            MessageRequest.status == "rejected",
            MessageRequest.created_at >= cooldown_time,
            or_(
                (
                    (MessageRequest.sender_id == user_id)
                    & (MessageRequest.receiver_id == Profile.user_id)
                ),
                (
                    (MessageRequest.sender_id == Profile.user_id)
                    & (MessageRequest.receiver_id == user_id)
                ),
            ),
        )
    )

    # ---------------------------------------------------------
    # 5. Existing match
    #
    # Matched users should never appear in Discover again.
    # ---------------------------------------------------------

    existing_match_exists = exists(
        select(Match.id).where(
            or_(
                (
                    (Match.user_one_id == user_id)
                    & (Match.user_two_id == Profile.user_id)
                ),
                (
                    (Match.user_one_id == Profile.user_id)
                    & (Match.user_two_id == user_id)
                ),
            )
        )
    )

    # ---------------------------------------------------------
    # Final Discover query
    # ---------------------------------------------------------

    result = await db.execute(
        select(Profile)
        .options(selectinload(Profile.photos))
        .where(
            # Only active profiles
            Profile.is_active.is_(True),

            # Don't show own profile
            Profile.user_id != user_id,

            # Hide profiles already liked
            ~Profile.id.in_(liked_profiles),

            # Hide recently passed profiles
            ~Profile.id.in_(recently_passed_profiles),

            # Hide profiles involved in pending requests
            ~pending_message_request_exists,

            # Hide recently declined requests
            ~recently_declined_request_exists,

            # Hide matched users
            ~existing_match_exists,
        )
        .order_by(Profile.id)
    )

    profiles = result.scalars().all()

    return [
        ProfileDetailResponse(
            id=p.id,
            user_id=p.user_id,
            display_name=p.display_name,
            age=p.age,
            degree=p.degree,
            year=p.year,
            branch=p.branch,
            bio=p.bio,
            is_verified=p.is_verified,
            is_active=p.is_active,
            photos=[
                ProfilePhotoResponse(
                    id=photo.id,
                    profile_id=photo.profile_id,
                    url=photo.url,
                    position=photo.position,
                )
                for photo in sorted(p.photos or [], key=lambda x: x.position)
            ],
        )
        for p in profiles
    ]