
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clearSession } from "../../lib/token";

export function LogoutButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    function handleLogout() {
        setLoading(true);

        clearSession();

        router.replace("/login");
        router.refresh();
    }

    return (
        <button
            type="button"
            onClick={handleLogout}
            disabled={loading}
            className="w-full rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-300 transition-colors hover:bg-red-400/20 disabled:opacity-50"
        >
            {loading ? "Logging out..." : "Log Out"}
        </button>
    );
}
