import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.dependencies import get_current_user_id
from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_db
from app.models.profile import Profile
from app.models.user import User
from app.schemas.auth import (
    AuthMessageResponse,
    ForgotPasswordRequest,
    GoogleAuthRequest,
    LoginRequest,
    LoginResponse,
    ResetPasswordRequest,
    SendEmailOtpRequest,
    SendPhoneOtpRequest,
    SignupRequest,
    VerificationStatusResponse,
    VerifyEmailOtpRequest,
    VerifyPhoneOtpRequest,
)
from app.services.auth_service import (
    create_or_refresh_otp,
    send_sms_via_provider,
    verify_google_id_token,
    verify_otp,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _verification_status(user: User) -> VerificationStatusResponse:
    return VerificationStatusResponse(
        user_id=user.id or 1,
        email_verified=bool(user.email_verified),
        phone_verified=bool(user.phone_verified),
        is_active=bool(user.is_active),
    )


# ---------------------------------------------------------
# SIGNUP
# ---------------------------------------------------------

@router.post("/signup", response_model=VerificationStatusResponse, status_code=201)
async def signup(signup_data: SignupRequest, db: AsyncSession = Depends(get_db)):
    email = signup_data.email.strip().lower()
    name = signup_data.name.strip()
    password = signup_data.password

    if not email or "@" not in email or len(password) < 8 or not name:
        raise HTTPException(
            status_code=422,
            detail="Enter a name, a valid email, and a password of at least 8 characters.",
        )

    existing = (await db.execute(select(User).where(User.email == email))).scalar_one_or_none()
    if existing:
        if not existing.email_verified:
            # User created previously (e.g. earlier failed signup request).
            # Ensure their profile exists
            existing_prof = (await db.execute(select(Profile).where(Profile.user_id == existing.id))).scalar_one_or_none()
            if not existing_prof:
                db.add(Profile(user_id=existing.id, display_name=name, is_active=True))
                await db.commit()
            # Send/refresh verification code so user can proceed
            await create_or_refresh_otp(db, email, "email_verification")
            return _verification_status(existing)

        raise HTTPException(
            status_code=409,
            detail="An account with this email address already exists. Please log in.",
        )

    phone_number = signup_data.phone_number.strip() if signup_data.phone_number else None
    if phone_number:
        existing_phone = (
            await db.execute(select(User).where(User.phone_number == phone_number))
        ).scalar_one_or_none()
        if existing_phone:
            raise HTTPException(
                status_code=409,
                detail="An account with this phone number already exists.",
            )

    bypass = (
        settings.dev_email_bypass_enabled
        and email in settings.DEV_EMAIL_VERIFICATION_BYPASS_ADDRESSES
    )

    user = User(
        email=email,
        name=name,
        password_hash=hash_password(password),
        phone_number=phone_number,
        email_verified=bypass,
        phone_verified=False,
        is_active=bypass,  # Active immediately only if verified by dev bypass
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    # Automatically create default Profile
    profile = Profile(
        user_id=user.id,
        display_name=name,
        is_active=True,
    )
    db.add(profile)
    await db.commit()

    # Automatically generate email OTP if not bypassed
    if not bypass:
        await create_or_refresh_otp(db, email, "email_verification")

    return _verification_status(user)


# ---------------------------------------------------------
# EMAIL OTP GENERATION & VERIFICATION
# ---------------------------------------------------------

@router.post("/email/send-otp", response_model=AuthMessageResponse)
async def send_email_otp(
    payload: SendEmailOtpRequest,
    db: AsyncSession = Depends(get_db),
):
    email = payload.email.strip().lower()
    user = (await db.execute(select(User).where(User.email == email))).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="No account registered with this email.")

    if user.email_verified:
        return AuthMessageResponse(message="Email is already verified.")

    code, is_new = await create_or_refresh_otp(db, email, "email_verification")
    if not is_new:
        return AuthMessageResponse(
            message=f"Verification code recently sent. Please check your inbox or wait {settings.OTP_RESEND_COOLDOWN_SECONDS}s."
        )

    logger.info("Email verification OTP for %s generated.", email)
    return AuthMessageResponse(
        message="Verification code sent to your email. Check your inbox."
    )


@router.post("/email/verify-otp", response_model=VerificationStatusResponse)
async def verify_email_otp(
    payload: VerifyEmailOtpRequest,
    db: AsyncSession = Depends(get_db),
):
    email = payload.email.strip().lower()
    user = (await db.execute(select(User).where(User.email == email))).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")

    success, error_msg = await verify_otp(
        db,
        identifier=email,
        token_type="email_verification",
        submitted_code=payload.otp,
    )
    if not success:
        raise HTTPException(status_code=400, detail=error_msg)

    user.email_verified = True
    user.is_active = True
    await db.commit()
    await db.refresh(user)

    return _verification_status(user)


# ---------------------------------------------------------
# PHONE OTP GENERATION & VERIFICATION
# ---------------------------------------------------------

@router.post("/phone/send-otp", response_model=AuthMessageResponse)
async def send_phone_otp(
    payload: SendPhoneOtpRequest,
    db: AsyncSession = Depends(get_db),
):
    phone = payload.phone_number.strip()
    if not phone or len(phone) < 8:
        raise HTTPException(status_code=422, detail="Please enter a valid phone number.")

    code, is_new = await create_or_refresh_otp(db, phone, "phone_verification")
    if not is_new:
        return AuthMessageResponse(
            message=f"A code was already sent recently. Please wait {settings.OTP_RESEND_COOLDOWN_SECONDS}s before requesting again."
        )

    sent, msg = await send_sms_via_provider(
        phone,
        f"Your CampusVerse verification code is: {code}. Valid for {settings.OTP_EXPIRE_MINUTES} minutes.",
    )

    if not sent:
        return AuthMessageResponse(
            message=f"Verification code generated. ({msg})",
            success=False,
        )

    return AuthMessageResponse(message="SMS verification code dispatched.")


@router.post("/phone/verify-otp", response_model=VerificationStatusResponse)
async def verify_phone_otp(
    payload: VerifyPhoneOtpRequest,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    phone = payload.phone_number.strip()
    user = (await db.execute(select(User).where(User.id == user_id))).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    success, error_msg = await verify_otp(
        db,
        identifier=phone,
        token_type="phone_verification",
        submitted_code=payload.otp,
    )
    if not success:
        raise HTTPException(status_code=400, detail=error_msg)

    user.phone_number = phone
    user.phone_verified = True
    await db.commit()
    await db.refresh(user)

    return _verification_status(user)


# ---------------------------------------------------------
# GOOGLE OAUTH
# ---------------------------------------------------------

@router.post("/google", response_model=LoginResponse)
async def google_auth(
    payload: GoogleAuthRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Secure server-side validation of Google identity token.
    Never trusts client-only success responses.
    """
    valid, info, error_msg = verify_google_id_token(payload.credential)
    if not valid or not info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Google authentication failed: {error_msg}",
        )

    email = info.get("email", "").strip().lower()
    name = info.get("name", "").strip() or email.split("@")[0]

    user = (await db.execute(select(User).where(User.email == email))).scalar_one_or_none()
    if not user:
        # Create user verified via Google OAuth
        user = User(
            email=email,
            name=name,
            password_hash=None,
            email_verified=True,
            phone_verified=False,
            is_active=True,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

        profile = Profile(
            user_id=user.id,
            display_name=name,
            is_active=True,
        )
        db.add(profile)
        await db.commit()
    else:
        # If user was previously inactive or unverified, Google OAuth verifies the email
        if not user.email_verified:
            user.email_verified = True
            user.is_active = True
            await db.commit()
            await db.refresh(user)

    user_id = user.id or 1
    access_token = create_access_token(user_id)
    return LoginResponse(
        access_token=access_token,
        user_id=user_id,
    )


# ---------------------------------------------------------
# FORGOT PASSWORD & RESET
# ---------------------------------------------------------

@router.post("/forgot-password", response_model=AuthMessageResponse)
async def forgot_password(
    payload: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    email = payload.email.strip().lower()
    user = (await db.execute(select(User).where(User.email == email))).scalar_one_or_none()
    if not user:
        # Don't leak user existence; return generic confirmation
        return AuthMessageResponse(
            message="If an account with that email exists, password reset instructions have been sent."
        )

    code, _ = await create_or_refresh_otp(db, email, "password_reset")
    logger.info("Password reset OTP generated for %s.", email)
    return AuthMessageResponse(
        message="If an account with that email exists, password reset instructions have been sent."
    )


@router.post("/reset-password", response_model=AuthMessageResponse)
async def reset_password(
    payload: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    email = payload.email.strip().lower()
    if len(payload.new_password) < 8:
        raise HTTPException(
            status_code=422,
            detail="Password must be at least 8 characters long.",
        )

    user = (await db.execute(select(User).where(User.email == email))).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Account not found.")

    success, error_msg = await verify_otp(
        db,
        identifier=email,
        token_type="password_reset",
        submitted_code=payload.otp,
    )
    if not success:
        raise HTTPException(status_code=400, detail=error_msg)

    user.password_hash = hash_password(payload.new_password)
    await db.commit()

    return AuthMessageResponse(message="Password successfully reset. You can now log in.")


# ---------------------------------------------------------
# LOGOUT
# ---------------------------------------------------------

@router.post("/logout", response_model=AuthMessageResponse)
async def logout(user_id: int = Depends(get_current_user_id)):
    """Logs out current user session."""
    return AuthMessageResponse(message="Successfully logged out.")


# ---------------------------------------------------------
# DEVELOPMENT BYPASS & STATUS
# ---------------------------------------------------------

@router.post("/{user_id}/verification/email/development-bypass", response_model=VerificationStatusResponse)
async def development_email_bypass(user_id: int, db: AsyncSession = Depends(get_db)):
    user = (await db.execute(select(User).where(User.id == user_id))).scalar_one_or_none()
    if (
        not user
        or not settings.dev_email_bypass_enabled
        or user.email.lower() not in settings.DEV_EMAIL_VERIFICATION_BYPASS_ADDRESSES
    ):
        raise HTTPException(status_code=404, detail="Verification method not available")
    user.email_verified = True
    user.is_active = True
    await db.commit()
    await db.refresh(user)
    return _verification_status(user)


@router.get("/{user_id}/verification", response_model=VerificationStatusResponse)
async def verification_status(user_id: int, db: AsyncSession = Depends(get_db)):
    user = (await db.execute(select(User).where(User.id == user_id))).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Verification record not found")
    return _verification_status(user)


# ---------------------------------------------------------
# STANDARD LOGIN
# ---------------------------------------------------------

@router.post("/login", response_model=LoginResponse)
async def login(
    login_data: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    email = login_data.email.strip().lower()
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user or not user.password_hash:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    if not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    if not user.email_verified:
        raise HTTPException(
            status_code=403,
            detail="Please verify your email address before logging in.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="User account is inactive.",
        )

    access_token = create_access_token(user.id)
    return LoginResponse(
        access_token=access_token,
        user_id=user.id,
    )
