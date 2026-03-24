export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

const ACCESS_TOKEN_KEY = "alx-access-token";

export function resolveAssetUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const origin = API_BASE_URL.replace(/\/api\/v1$/, "");
  return `${origin}${path}`;
}

export function getStoredAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setStoredAccessToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (!token) {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    return;
  }
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

type ApiOptions = RequestInit & { bodyJson?: unknown };

export async function clientApi<T>(path: string, options?: ApiOptions): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 12000);
  const token = getStoredAccessToken();

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: "include",
      ...options,
      signal: options?.signal ?? controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options?.headers ?? {}),
      },
      body: options?.bodyJson ? JSON.stringify(options.bodyJson) : options?.body,
    });
  } catch (error) {
    window.clearTimeout(timeout);
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("The request timed out. Please try again.");
    }
    throw new Error("Could not reach the server. Please check your connection and try again.");
  }
  window.clearTimeout(timeout);

  if (!response.ok) {
    if (response.status === 401) {
      setStoredAccessToken(null);
    }
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const payload = await response.json();
      throw new Error(payload.detail ?? "Request failed");
    }
    const detail = await response.text();
    throw new Error(detail || "Request failed");
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  return response as T;
}
