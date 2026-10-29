import asyncio
import unittest
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock, patch

from app.api.v1.auth import (
    development_email_bypass,
    forgot_password,
    google_auth,
    login,
    reset_password,
    send_email_otp,
    send_phone_otp,
    signup,
    verify_email_otp,
    verify_phone_otp,
)
from app.core.config import settings
from app.core.security import create_access_token, decode_access_token, hash_password, verify_password
from app.models.user import User
from app.models.verification_token import VerificationToken
from app.schemas.auth import (
    ForgotPasswordRequest,
    GoogleAuthRequest,
    LoginRequest,
    ResetPasswordRequest,
    SendEmailOtpRequest,
    SendPhoneOtpRequest,
    SignupRequest,
    VerifyEmailOtpRequest,
    VerifyPhoneOtpRequest,
)
from app.services.auth_service import create_or_refresh_otp, generate_numeric_otp, verify_otp


class FakeResult:
    def __init__(self, value=None, scalar_list=None):
        self._value = value
        self._scalar_list = scalar_list or []

    def scalar_one_or_none(self):
        return self._value

    def scalars(self):
        m = MagicMock()
        m.all = lambda: self._scalar_list
        m.first = lambda: self._value if self._value is not None else (self._scalar_list[0] if self._scalar_list else None)
        return m


class AuthTestSuite(unittest.TestCase):
    def test_password_hashing_and_verification(self):
        pwd = "SecretPassword123!"
        hashed = hash_password(pwd)
        self.assertNotEqual(pwd, hashed)
        self.assertTrue(verify_password(pwd, hashed))
        self.assertFalse(verify_password("WrongPassword!", hashed))

    def test_access_token_creation_and_decoding(self):
        user_id = 42
        token = create_access_token(user_id)
        self.assertIsInstance(token, str)
        decoded = decode_access_token(token)
        self.assertEqual(decoded, user_id)

    def test_generate_numeric_otp_format(self):
        code = generate_numeric_otp(6)
        self.assertEqual(len(code), 6)
        self.assertTrue(code.isdigit())

    def test_signup_creates_inactive_unverified_user_by_default(self):
        db = MagicMock()
        db.execute = AsyncMock(return_value=FakeResult(value=None))
        db.add = MagicMock()
        db.commit = AsyncMock()
        db.refresh = AsyncMock()

        req = SignupRequest(
            name="Alice",
            email="alice@test.edu",
            password="StrongPassword123",
        )

        with patch("app.api.v1.auth.create_or_refresh_otp", new_callable=AsyncMock) as mock_otp:
            mock_otp.return_value = ("123456", True)
            res = asyncio.run(signup(req, db=db))
            self.assertFalse(res.email_verified)
            self.assertFalse(res.phone_verified)
            self.assertFalse(res.is_active)
            self.assertEqual(db.add.call_count, 2)  # User + Profile

    def test_login_enforces_active_and_verified_email(self):
        hashed = hash_password("CorrectPassword123")
        unverified_user = User(
            id=1,
            email="alice@test.edu",
            name="Alice",
            password_hash=hashed,
            email_verified=False,
            phone_verified=False,
            is_active=False,
        )

        db = MagicMock()
        db.execute = AsyncMock(return_value=FakeResult(value=unverified_user))

        # Attempt login with unverified email
        with self.assertRaises(Exception) as ctx:
            asyncio.run(
                login(
                    LoginRequest(email="alice@test.edu", password="CorrectPassword123"),
                    db=db,
                )
            )
        self.assertEqual(ctx.exception.status_code, 403)

        # Attempt login with verified email
        unverified_user.email_verified = True
        unverified_user.is_active = True
        res = asyncio.run(
            login(
                LoginRequest(email="alice@test.edu", password="CorrectPassword123"),
                db=db,
            )
        )
        self.assertEqual(res.user_id, 1)
        self.assertTrue(res.access_token)

    def test_verify_email_otp_activates_account(self):
        user = User(
            id=2,
            email="bob@test.edu",
            name="Bob",
            password_hash="...",
            email_verified=False,
            is_active=False,
        )
        db = MagicMock()
        db.execute = AsyncMock(return_value=FakeResult(value=user))
        db.commit = AsyncMock()
        db.refresh = AsyncMock()

        with patch("app.api.v1.auth.verify_otp", new_callable=AsyncMock) as mock_verify:
            mock_verify.return_value = (True, "")
            res = asyncio.run(
                verify_email_otp(
                    VerifyEmailOtpRequest(email="bob@test.edu", otp="654321"),
                    db=db,
                )
            )
            self.assertTrue(user.email_verified)
            self.assertTrue(user.is_active)
            self.assertTrue(res.email_verified)

    def test_google_auth_validates_token_backend(self):
        db = MagicMock()
        db.execute = AsyncMock(return_value=FakeResult(value=None))
        db.add = MagicMock()
        db.commit = AsyncMock()
        db.refresh = AsyncMock()

        # Mock tokeninfo payload from Google
        mock_payload = {
            "email": "carol@college.edu",
            "name": "Carol Danvers",
            "aud": "",
        }

        with patch("app.api.v1.auth.verify_google_id_token") as mock_verify_google:
            mock_verify_google.return_value = (True, mock_payload, "")
            res = asyncio.run(
                google_auth(
                    GoogleAuthRequest(credential="valid_mock_jwt_token"),
                    db=db,
                )
            )
            self.assertTrue(res.access_token)
            self.assertEqual(db.add.call_count, 2)  # User + Profile

    def test_google_auth_rejects_invalid_token(self):
        db = MagicMock()
        with patch("app.api.v1.auth.verify_google_id_token") as mock_verify_google:
            mock_verify_google.return_value = (False, None, "Token expired")
            with self.assertRaises(Exception) as ctx:
                asyncio.run(
                    google_auth(
                        GoogleAuthRequest(credential="invalid_token"),
                        db=db,
                    )
                )
            self.assertEqual(ctx.exception.status_code, 401)

    def test_password_reset_flow(self):
        user = User(
            id=3,
            email="david@test.edu",
            name="David",
            password_hash=hash_password("OldPassword123"),
            email_verified=True,
            is_active=True,
        )
        db = MagicMock()
        db.execute = AsyncMock(return_value=FakeResult(value=user))
        db.commit = AsyncMock()

        with patch("app.api.v1.auth.verify_otp", new_callable=AsyncMock) as mock_verify:
            mock_verify.return_value = (True, "")
            res = asyncio.run(
                reset_password(
                    ResetPasswordRequest(
                        email="david@test.edu",
                        otp="112233",
                        new_password="BrandNewPassword123!",
                    ),
                    db=db,
                )
            )
            self.assertTrue(res.success)
            self.assertTrue(verify_password("BrandNewPassword123!", user.password_hash))


if __name__ == "__main__":
    unittest.main()
