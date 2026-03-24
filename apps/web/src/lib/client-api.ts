export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export function resolveAssetUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const origin = API_BASE_URL.replace(/\/api\/v1$/, "");
  return `${origin}${path}`;
}

type ApiOptions = RequestInit & { bodyJson?: unknown };

export async function clientApi<T>(path: string, options?: ApiOptions): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    body: options?.bodyJson ? JSON.stringify(options.bodyJson) : options?.body,
  });

  if (!response.ok) {
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
