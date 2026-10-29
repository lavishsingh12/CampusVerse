"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  loginUser,
  signupUser,
  sendEmailOtp,
  verifyEmailOtp,
  sendPhoneOtp,
  verifyPhoneOtp,
  forgotPassword,
  resetPassword,
  loginWithGoogle,
} from "../../lib/auth";
import { saveSession, getAccessToken } from "../../lib/token";

declare global {
  interface Window {
    google?: any;
  }
}

type AuthMode = "login" | "signup" | "verify_email" | "verify_phone" | "forgot_password" | "reset_password";

export default function LoginPage() {
  const router = useRouter();
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [manualTokenInput, setManualTokenInput] = useState(false);
  const [manualToken, setManualToken] = useState("");

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  // Google OAuth submit
  const handleGoogleLogin = useCallback(async (credential: string) => {
    if (!credential.trim()) {
      setError("Please paste or provide a Google ID Token.");
      return;
    }
    setError("");
    setNotice("");
    setLoading(true);

    try {
      const result = await loginWithGoogle(credential.trim());
      saveSession(result.access_token, result.user_id);
      router.replace("/chats");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google authentication failed.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Initialize Google Identity Services if client ID is configured
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
    if (typeof window !== "undefined" && window.google?.accounts?.id && clientId) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: { credential: string }) => {
            if (response.credential) {
              void handleGoogleLogin(response.credential);
            }
          },
        });
        if (googleBtnRef.current) {
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: "outline",
            size: "large",
            width: "100%",
            text: "continue_with",
            shape: "rectangular",
          });
        }
      } catch (err) {
        console.warn("Failed to initialize Google Sign-in widget:", err);
      }
    }
  }, [mode, handleGoogleLogin]);

  function resetState(newMode: AuthMode) {
    setMode(newMode);
    setError("");
    setNotice("");
    setOtp("");
  }

  // Handle standard login
  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    try {
      const result = await loginUser({ email, password });
      saveSession(result.access_token, result.user_id);
      router.replace("/chats");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed. Please check credentials.";
      setError(msg);
      // If error indicates unverified email, offer quick transition to verify email
      if (msg.toLowerCase().includes("verify your email")) {
        setNotice("Your email is unverified. We can verify it now.");
      }
    } finally {
      setLoading(false);
    }
  }

  // Handle signup
  async function handleSignup(e: FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    try {
      const result = await signupUser({
        name,
        email,
        password,
        phone_number: phoneNumber.trim() || undefined,
      });

      if (result.email_verified) {
        setNotice("Account created and verified! You can log in.");
        setMode("login");
      } else {
        setNotice("Account created. Please enter the 6-digit verification code sent to your email.");
        setMode("verify_email");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Verify email OTP
  async function handleVerifyEmail(e: FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    try {
      await verifyEmailOtp(email, otp);
      setNotice("Email verified successfully! You can now log in.");
      setMode("login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setLoading(false);
    }
  }

  // Resend email OTP
  async function handleResendEmailOtp() {
    setError("");
    setNotice("");
    setLoading(true);
    try {
      const res = await sendEmailOtp(email);
      setNotice(res.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend code.");
    } finally {
      setLoading(false);
    }
  }

  // Forgot password request
  async function handleForgotPassword(e: FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    try {
      const res = await forgotPassword(email);
      setNotice(res.message + " Please enter the code below with your new password.");
      setMode("reset_password");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset instructions.");
    } finally {
      setLoading(false);
    }
  }

  // Reset password submit
  async function handleResetPassword(e: FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    try {
      const res = await resetPassword(email, otp, newPassword);
      setNotice(res.message);
      setMode("login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  }

  // Google OAuth submit
  async function handleGoogleLogin(credential: string) {
    if (!credential.trim()) {
      setError("Please paste or provide a Google ID Token.");
      return;
    }
    setError("");
    setNotice("");
    setLoading(true);

    try {
      const result = await loginWithGoogle(credential.trim());
      saveSession(result.access_token, result.user_id);
      router.replace("/chats");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0B0C15] flex items-center justify-center px-5 py-8 text-white select-none">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#181B30] p-6 sm:p-8 space-y-6 shadow-2xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            CampusVerse
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {mode === "login" && "Log in to your account"}
            {mode === "signup" && "Join your campus community"}
            {mode === "verify_email" && "Verify your email address"}
            {mode === "verify_phone" && "Verify your phone number"}
            {mode === "forgot_password" && "Reset your password"}
            {mode === "reset_password" && "Enter code & new password"}
          </p>
        </div>

        {error && (
          <div role="alert" className="p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-xs sm:text-sm text-red-300">
            {error}
          </div>
        )}

        {notice && (
          <div role="status" className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs sm:text-sm text-emerald-300">
            {notice}
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-slate-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@college.edu"
                className="w-full rounded-xl border border-white/10 bg-[#0B0C15] px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-[#B365FC] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-semibold text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => resetState("forgot_password")}
                  className="text-xs text-[#D7B4FF] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-[#0B0C15] px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-[#B365FC] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-[#9B42F6] to-[#E93C9A] py-3.5 font-bold text-white shadow-lg shadow-[#9B42F6]/20 transition-all hover:opacity-95 active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Signing in..." : "Log In"}
            </button>

            {/* Google OAuth & Alternate options */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="border-t border-white/10 w-full" />
              <span className="bg-[#181B30] px-3 text-xs text-slate-500 uppercase tracking-wider">
                Or
              </span>
            </div>

            <div className="space-y-3">
              {/* Google Identity Services rendered button */}
              <div ref={googleBtnRef} className="w-full flex justify-center min-h-[44px]" />

              {/* Direct token or prompt fallback for local/dev use */}
              {!manualTokenInput ? (
                <button
                  type="button"
                  onClick={() => setManualTokenInput(true)}
                  className="w-full text-center text-xs text-slate-400 hover:text-white"
                >
                  Using custom/development Google token? Click here
                </button>
              ) : (
                <div className="p-3 rounded-xl border border-white/10 bg-[#0B0C15] space-y-2">
                  <label htmlFor="google-token" className="text-xs text-slate-400 block">
                    Paste Google ID Token
                  </label>
                  <input
                    id="google-token"
                    type="text"
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    placeholder="eyJhbGciOiJSUzI1NiIs..."
                    className="w-full rounded-lg border border-white/10 bg-[#181B30] px-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-[#B365FC]"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={loading || !manualToken.trim()}
                      onClick={() => void handleGoogleLogin(manualToken)}
                      className="flex-1 rounded-lg bg-[#B365FC] py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      Verify & Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => setManualTokenInput(false)}
                      className="px-3 rounded-lg border border-white/10 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => resetState("verify_email")}
                className="w-full text-center text-xs text-[#D7B4FF] hover:underline pt-1"
              >
                Need to verify an existing email? Click here
              </button>
            </div>

            <div className="pt-2 text-center text-sm text-slate-400">
              New to CampusVerse?{" "}
              <button
                type="button"
                onClick={() => resetState("signup")}
                className="font-bold text-[#D7B4FF] hover:underline"
              >
                Create an account
              </button>
            </div>
          </form>
        )}

        {/* 2. SIGNUP FORM */}
        {mode === "signup" && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="reg-name" className="text-xs font-semibold text-slate-300">
                Full Name
              </label>
              <input
                id="reg-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rohan Sharma"
                className="w-full rounded-xl border border-white/10 bg-[#0B0C15] px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-[#B365FC] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-email" className="text-xs font-semibold text-slate-300">
                College Email
              </label>
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rohan@dtu.ac.in"
                className="w-full rounded-xl border border-white/10 bg-[#0B0C15] px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-[#B365FC] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-phone" className="text-xs font-semibold text-slate-300">
                Phone Number (optional)
              </label>
              <input
                id="reg-phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full rounded-xl border border-white/10 bg-[#0B0C15] px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-[#B365FC] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-pass" className="text-xs font-semibold text-slate-300">
                Password (min 8 characters)
              </label>
              <input
                id="reg-pass"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-[#0B0C15] px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-[#B365FC] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-[#9B42F6] to-[#E93C9A] py-3.5 font-bold text-white shadow-lg shadow-[#9B42F6]/20 transition-all hover:opacity-95 active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>

            <div className="pt-2 text-center text-sm text-slate-400">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => resetState("login")}
                className="font-bold text-[#D7B4FF] hover:underline"
              >
                Log In
              </button>
            </div>
          </form>
        )}

        {/* 3. VERIFY EMAIL OTP */}
        {mode === "verify_email" && (
          <form onSubmit={handleVerifyEmail} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="ver-email" className="text-xs font-semibold text-slate-300">
                Email
              </label>
              <input
                id="ver-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0B0C15] px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-[#B365FC] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="ver-otp" className="text-xs font-semibold text-slate-300">
                6-Digit Verification Code
              </label>
              <input
                id="ver-otp"
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full rounded-xl border border-white/10 bg-[#0B0C15] px-4 py-3 text-center text-lg tracking-widest font-mono text-white placeholder-slate-600 outline-none focus:border-[#B365FC] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full rounded-xl bg-[#B365FC] py-3.5 font-bold text-white shadow-lg transition-all hover:opacity-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
              <button
                type="button"
                onClick={handleResendEmailOtp}
                disabled={loading}
                className="text-[#D7B4FF] hover:underline"
              >
                Resend Code
              </button>
              <button
                type="button"
                onClick={() => resetState("login")}
                className="hover:text-white"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}

        {/* 4. FORGOT PASSWORD */}
        {mode === "forgot_password" && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="fp-email" className="text-xs font-semibold text-slate-300">
                Registered Email
              </label>
              <input
                id="fp-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@college.edu"
                className="w-full rounded-xl border border-white/10 bg-[#0B0C15] px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-[#B365FC] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full rounded-xl bg-[#B365FC] py-3.5 font-bold text-white shadow-lg transition-all hover:opacity-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Sending Code..." : "Send Reset Code"}
            </button>

            <div className="pt-2 text-center text-xs text-slate-400">
              Remembered your password?{" "}
              <button
                type="button"
                onClick={() => resetState("login")}
                className="text-[#D7B4FF] hover:underline font-bold"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}

        {/* 5. RESET PASSWORD WITH OTP */}
        {mode === "reset_password" && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="rp-email" className="text-xs font-semibold text-slate-300">
                Email
              </label>
              <input
                id="rp-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0B0C15] px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-[#B365FC] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="rp-otp" className="text-xs font-semibold text-slate-300">
                Reset Code
              </label>
              <input
                id="rp-otp"
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full rounded-xl border border-white/10 bg-[#0B0C15] px-4 py-3 text-center text-lg tracking-widest font-mono text-white placeholder-slate-600 outline-none focus:border-[#B365FC] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="rp-newpass" className="text-xs font-semibold text-slate-300">
                New Password (min 8 chars)
              </label>
              <input
                id="rp-newpass"
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-[#0B0C15] px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-[#B365FC] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6 || newPassword.length < 8}
              className="w-full rounded-xl bg-gradient-to-r from-[#9B42F6] to-[#E93C9A] py-3.5 font-bold text-white shadow-lg transition-all hover:opacity-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Updating..." : "Reset Password & Log In"}
            </button>

            <div className="pt-2 text-center text-xs text-slate-400">
              <button
                type="button"
                onClick={() => resetState("login")}
                className="text-[#D7B4FF] hover:underline"
              >
                Cancel and return to Login
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
