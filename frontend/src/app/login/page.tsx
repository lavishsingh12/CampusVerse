"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "../../lib/auth";
import { saveSession } from "../../lib/token";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await loginUser({ email, password });

            saveSession(result.access_token, result.user_id);
            router.replace("/chats");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Login failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-[#0B0C15] flex items-center justify-center px-5 text-white">
            <form
                onSubmit={handleLogin}
                className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#181B30] p-6 space-y-5"
            >
                <div>
                    <h1 className="text-2xl font-bold">
                        Welcome to CampusVerse
                    </h1>
                    <p className="mt-2 text-sm text-slate-400">
                        Log in to continue to your account.
                    </p>
                </div>

                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm text-slate-300">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full rounded-xl border border-white/10 bg-[#0B0C15] px-4 py-3 text-sm outline-none focus:border-[#B365FC]"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="password" className="text-sm text-slate-300">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full rounded-xl border border-white/10 bg-[#0B0C15] px-4 py-3 text-sm outline-none focus:border-[#B365FC]"
                    />
                </div>

                {error && (
                    <p role="alert" className="text-sm text-red-400">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-[#B365FC] py-3 font-semibold text-white disabled:opacity-60"
                >
                    {loading ? "Logging in..." : "Log In"}
                </button>
            </form>
        </main>
    );
}