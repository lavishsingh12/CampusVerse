from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.dependencies import get_current_user_id
from app.db.session import get_db
from app.models.profile import Profile
from app.models.profile_photo import ProfilePhoto
from app.models.user import User
from app.schemas.profile import (
    ProfileCreate,
    ProfileDetailResponse,
    ProfileResponse,
    ProfileUpdate,
)
from app.schemas.profile_photo import ProfilePhotoResponse

router = APIRouter(prefix="/profiles", tags=["Profiles"])


@router.get("/me", response_model=ProfileDetailResponse)
async def get_my_profile(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    result = await db.execute(
        select(User)
        .options(selectinload(User.profile).selectinload(Profile.photos))
        .where(User.id == user_id)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    profile = user.profile
    if not profile:
        # Create an initial profile for the user if none exists
        profile = Profile(
            user_id=user_id,
            display_name=user.name,
            age=20,
            degree="Student",
            year="1st Year",
            branch="General",
            bio="",
            is_verified=False,
            is_active=False,
        )
        db.add(profile)
        await db.commit()
        await db.refresh(profile)

    # Sort photos by position
    photos_list = sorted(
        profile.photos or [],
        key=lambda p: p.position,
    )

    return ProfileDetailResponse(
        id=profile.id,
        user_id=profile.user_id,
        display_name=profile.display_name,
        age=profile.age,
        degree=profile.degree,
        year=profile.year,
        branch=profile.branch,
        bio=profile.bio,
        university=profile.university,
        campus=profile.campus,
        lifestyle=profile.lifestyle,
        interests=profile.interests,
        icebreakers=profile.icebreakers,
        is_verified=profile.is_verified,
        is_active=profile.is_active,
        email=user.email,
        user_name=user.name,
        is_premium=user.is_premium,
        photos=[
            ProfilePhotoResponse(
                id=p.id,
                profile_id=p.profile_id,
                url=p.url,
                position=p.position,
            )
            for p in photos_list
        ],
    )


@router.post("", response_model=ProfileResponse, status_code=201)
async def create_profile(
    profile_data: ProfileCreate,
    db: AsyncSession = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    # Only allow user to create their own profile
    if profile_data.user_id != current_user_id:
        raise HTTPException(
            status_code=403,
            detail="You cannot create a profile for another user",
        )

    result = await db.execute(select(User).where(User.id == profile_data.user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    result = await db.execute(
        select(Profile).where(Profile.user_id == profile_data.user_id)
    )
    existing_profile = result.scalar_one_or_none()

    if existing_profile:
        raise HTTPException(
            status_code=409,
            detail="Profile already exists for this user",
        )

    profile = Profile(
        user_id=profile_data.user_id,
        display_name=profile_data.display_name,
        age=profile_data.age,
        degree=profile_data.degree,
        year=profile_data.year,
        branch=profile_data.branch,
        bio=profile_data.bio,
        university=profile_data.university,
        campus=profile_data.campus,
        lifestyle=profile_data.lifestyle,
        interests=(
            [item.model_dump() for item in profile_data.interests]
            if profile_data.interests is not None
            else None
        ),
        icebreakers=(
            [item.model_dump() for item in profile_data.icebreakers]
            if profile_data.icebreakers is not None
            else None
        ),
    )

    db.add(profile)
    await db.commit()
    await db.refresh(profile)

    return profile


@router.get("/{profile_id}", response_model=ProfileResponse)
async def get_profile(
    profile_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Profile).where(Profile.id == profile_id))
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found",
        )

    return profile


@router.put("/{profile_id}", response_model=ProfileResponse)
async def update_profile(
    profile_id: int,
    profile_data: ProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    result = await db.execute(select(Profile).where(Profile.id == profile_id))
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found",
        )

    if profile.user_id != current_user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only edit your own profile",
        )

    update_data = profile_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(profile, field, value)

    await db.commit()
    await db.refresh(profile)

    return profile


@router.post("/{profile_id}/activate", response_model=ProfileResponse)
async def activate_profile(
    profile_id: int,
    db: AsyncSession = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    result = await db.execute(select(Profile).where(Profile.id == profile_id))
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found",
        )

    if profile.user_id != current_user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only activate your own profile",
        )

    if not profile.is_verified:
        raise HTTPException(
            status_code=400,
            detail="Profile must be verified before activation",
        )

    result = await db.execute(
        select(func.count(ProfilePhoto.id)).where(ProfilePhoto.profile_id == profile_id)
    )
    photo_count = result.scalar_one()

    if photo_count < 2:
        raise HTTPException(
            status_code=400,
            detail="Profile must have at least 2 photos before activation",
        )

    profile.is_active = True

    await db.commit()
    await db.refresh(profile)

    return profile
