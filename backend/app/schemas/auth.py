from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int


class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    phone_number: str | None = None


class VerificationStatusResponse(BaseModel):
    user_id: int
    email_verified: bool
    phone_verified: bool
    is_active: bool


class SendEmailOtpRequest(BaseModel):
    email: str


class VerifyEmailOtpRequest(BaseModel):
    email: str
    otp: str


class SendPhoneOtpRequest(BaseModel):
    phone_number: str


class VerifyPhoneOtpRequest(BaseModel):
    phone_number: str
    otp: str


class GoogleAuthRequest(BaseModel):
    credential: str  # The ID token from Google


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    new_password: str


class AuthMessageResponse(BaseModel):
    message: str
    success: bool = True
