
const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

export function resolveApiMediaUrl(url: string): string {
    if (/^https?:\/\//i.test(url)) return url;
    return new URL(url, API_BASE_URL).toString();
}

export async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string
): Promise<T> {
    const isFormData =
        typeof FormData !== "undefined" && options.body instanceof FormData;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            ...(!isFormData ? { "Content-Type": "application/json" } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
        cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const message =
            data?.detail || `Request failed with status ${response.status}`;
        throw new Error(message);
    }

    return data as T;
}
