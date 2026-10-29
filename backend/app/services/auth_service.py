import json
import logging
import secrets
import urllib.request
import urllib.parse
from datetime import datetime, timedelta, timezone

from sqlalchemy import delete, desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.verification_token import VerificationToken

logger = logging.getLogger(__name__)


def generate_numeric_otp(length: int = 6) -> str:
    """Generate a cryptographically secure numeric OTP."""
    digits = "0123456789"
    return "".join(secrets.choice(digits) for _ in range(length))


async def create_or_refresh_otp(
    db: AsyncSession,
    identifier: str,
    token_type: str,
) -> tuple[str, bool]:
    """
    Creates an OTP for an identifier and token_type.
    Enforces cooldown seconds between requests.
    Returns (otp_code, is_new).
    """
    clean_id = identifier.strip().lower()
    now = datetime.now(timezone.utc)
    cooldown = timedelta(seconds=settings.OTP_RESEND_COOLDOWN_SECONDS)

    # Check for recent active OTP within cooldown
    recent = (
        await db.execute(
            select(VerificationToken)
            .where(
                VerificationToken.identifier == clean_id,
                VerificationToken.token_type == token_type,
                VerificationToken.is_used.is_(False),
                VerificationToken.expires_at > now,
            )
            .order_by(desc(VerificationToken.created_at))
        )
    ).scalars().first()

    if recent and (now - recent.created_at.replace(tzinfo=timezone.utc)) < cooldown:
        # Cooldown period still active: return remaining time error or existing
        return recent.code, False

    # Invalidate older unverified tokens for this identifier & type
    await db.execute(
        delete(VerificationToken).where(
            VerificationToken.identifier == clean_id,
            VerificationToken.token_type == token_type,
        )
    )

    code = generate_numeric_otp(6)
    expires_at = now + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)

    token_record = VerificationToken(
        identifier=clean_id,
        token_type=token_type,
        code=code,
        attempts=0,
        is_used=False,
        expires_at=expires_at,
    )
    db.add(token_record)
    await db.commit()
    await db.refresh(token_record)

    return code, True


async def verify_otp(
    db: AsyncSession,
    identifier: str,
    token_type: str,
    submitted_code: str,
) -> tuple[bool, str]:
    """
    Verifies submitted OTP code.
    Returns (success: bool, error_message: str).
    """
    clean_id = identifier.strip().lower()
    clean_code = submitted_code.strip()
    now = datetime.now(timezone.utc)

    token_record = (
        await db.execute(
            select(VerificationToken)
            .where(
                VerificationToken.identifier == clean_id,
                VerificationToken.token_type == token_type,
                VerificationToken.is_used.is_(False),
            )
            .order_by(desc(VerificationToken.created_at))
        )
    ).scalars().first()

    if not token_record:
        return False, "No active verification code found. Please request a new code."

    # Check expiry
    record_expires = token_record.expires_at
    if record_expires.tzinfo is None:
        record_expires = record_expires.replace(tzinfo=timezone.utc)

    if record_expires < now:
        return False, "Verification code has expired. Please request a new one."

    # Check max attempts
    if token_record.attempts >= settings.OTP_MAX_ATTEMPTS:
        return False, "Maximum verification attempts exceeded. Please request a new code."

    if token_record.code != clean_code:
        token_record.attempts += 1
        await db.commit()
        remaining = settings.OTP_MAX_ATTEMPTS - token_record.attempts
        return False, f"Invalid code. {remaining} attempt(s) remaining."

    # Success: mark as used
    token_record.is_used = True
    await db.commit()
    return True, ""


async def send_sms_via_provider(phone_number: str, message: str) -> tuple[bool, str]:
    """
    Sends SMS via configured provider (e.g. Twilio API).
    If provider credentials are not configured, logs cleanly and returns instructions.
    """
    account_sid = settings.SMS_PROVIDER_ACCOUNT_SID
    auth_token = settings.SMS_PROVIDER_AUTH_TOKEN
    from_number = settings.SMS_PROVIDER_FROM_NUMBER

    if not account_sid or not auth_token or not from_number:
        logger.warning(
            "SMS provider credentials not configured (SMS_PROVIDER_ACCOUNT_SID / SMS_PROVIDER_AUTH_TOKEN). "
            "SMS could not be dispatched live to %s.",
            phone_number,
        )
        return False, "SMS provider credentials not configured. Contact server administrator or set up Twilio in .env."

    try:
        url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"
        data = urllib.parse.urlencode({
            "To": phone_number,
            "From": from_number,
            "Body": message,
        }).encode("utf-8")

        req = urllib.request.Request(url, data=data)
        import base64
        auth_header = base64.b64encode(f"{account_sid}:{auth_token}".encode("utf-8")).decode("ascii")
        req.add_header("Authorization", f"Basic {auth_header}")

        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.status in (200, 201):
                return True, "SMS dispatched successfully."
            return False, f"SMS provider returned status {resp.status}."
    except Exception as exc:
        logger.error("Failed to dispatch SMS to %s: %s", phone_number, exc)
        return False, f"SMS delivery failed: {str(exc)}"


def verify_google_id_token(id_token_str: str) -> tuple[bool, dict | None, str]:
    """
    Validates a Google OAuth ID token securely on the backend against Google's tokeninfo API.
    Does NOT trust client-side responses.
    Returns (valid: bool, payload: dict | None, error_message: str).
    """
    if not id_token_str or not id_token_str.strip():
        return False, None, "Google ID token cannot be empty."

    try:
        encoded_token = urllib.parse.quote(id_token_str.strip())
        url = f"https://oauth2.googleapis.com/tokeninfo?id_token={encoded_token}"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=8) as resp:
            if resp.status != 200:
                return False, None, f"Google token verification failed with status {resp.status}."
            payload = json.loads(resp.read().decode("utf-8"))

        # Verify audience if GOOGLE_CLIENT_ID configured
        expected_aud = settings.GOOGLE_CLIENT_ID.strip()
        if expected_aud:
            aud = payload.get("aud")
            if aud != expected_aud:
                return False, None, f"Token audience mismatch (aud: {aud})."

        # Verify email is present
        email = payload.get("email")
        if not email:
            return False, None, "Google profile did not contain an email address."

        return True, payload, ""
    except Exception as exc:
        return False, None, f"Google OAuth token verification failed: {str(exc)}"
