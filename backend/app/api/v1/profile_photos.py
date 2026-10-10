from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user_id
from app.db.session import get_db
from app.models.profile import Profile
from app.models.profile_photo import ProfilePhoto
from app.schemas.profile_photo import (
    ProfilePhotoCreate,
    ProfilePhotoResponse,
    ReorderPhotosRequest,
)

router = APIRouter(
    prefix="/profiles/{profile_id}/photos",
    tags=["Profile Photos"],
)


async def get_and_verify_user_profile(
    profile_id: int,
    user_id: int,
    db: AsyncSession,
) -> Profile:
    result = await db.execute(
        select(Profile).where(Profile.id == profile_id)
    )
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found",
        )

    if profile.user_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only manage photos for your own profile",
        )

    return profile


@router.post("", response_model=ProfilePhotoResponse, status_code=201)
async def add_profile_photo(
    profile_id: int,
    photo_data: ProfilePhotoCreate,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    await get_and_verify_user_profile(profile_id, user_id, db)

    result = await db.execute(
        select(func.count(ProfilePhoto.id)).where(
            ProfilePhoto.profile_id == profile_id
        )
    )
    photo_count = result.scalar_one()

    if photo_count >= 6:
        raise HTTPException(
            status_code=400,
            detail="A profile can have a maximum of 6 photos",
        )

    photo = ProfilePhoto(
        profile_id=profile_id,
        url=photo_data.url,
        position=photo_data.position,
    )

    db.add(photo)
    await db.commit()
    await db.refresh(photo)

    return photo


@router.get("", response_model=list[ProfilePhotoResponse])
async def get_profile_photos(
    profile_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ProfilePhoto)
        .where(ProfilePhoto.profile_id == profile_id)
        .order_by(ProfilePhoto.position)
    )

    return result.scalars().all()


@router.put("/reorder", response_model=list[ProfilePhotoResponse])
async def reorder_profile_photos(
    profile_id: int,
    reorder_data: ReorderPhotosRequest,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    await get_and_verify_user_profile(profile_id, user_id, db)

    for item in reorder_data.photos:
        result = await db.execute(
            select(ProfilePhoto).where(
                ProfilePhoto.id == item.photo_id,
                ProfilePhoto.profile_id == profile_id,
            )
        )
        photo = result.scalar_one_or_none()
        if photo:
            photo.position = item.position

    await db.commit()

    # Return photos in updated order
    result = await db.execute(
        select(ProfilePhoto)
        .where(ProfilePhoto.profile_id == profile_id)
        .order_by(ProfilePhoto.position)
    )
    return result.scalars().all()


@router.delete("/{photo_id}", status_code=204)
async def delete_profile_photo(
    profile_id: int,
    photo_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    profile = await get_and_verify_user_profile(profile_id, user_id, db)

    # Check total photos count - prevent removing if active and would leave < 2
    count_result = await db.execute(
        select(func.count(ProfilePhoto.id)).where(
            ProfilePhoto.profile_id == profile_id
        )
    )
    total_photos = count_result.scalar_one()

    if profile.is_active and total_photos <= 2:
        raise HTTPException(
            status_code=400,
            detail="Active profiles require a minimum of 2 photos. Please add a replacement before deleting.",
        )

    result = await db.execute(
        select(ProfilePhoto).where(
            ProfilePhoto.id == photo_id,
            ProfilePhoto.profile_id == profile_id,
        )
    )
    photo = result.scalar_one_or_none()

    if not photo:
        raise HTTPException(
            status_code=404,
            detail="Photo not found",
        )

    await db.delete(photo)
    await db.commit()

