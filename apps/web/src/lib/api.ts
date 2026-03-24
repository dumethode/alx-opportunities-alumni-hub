import "server-only";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed for ${path}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  getHome: () => request<any>("/home"),
  getOpportunities: (searchParams?: URLSearchParams) =>
    request<any>(`/opportunities${searchParams ? `?${searchParams.toString()}` : ""}`),
  getOpportunity: (slug: string) => request<any>(`/opportunities/${slug}`),
  getEvents: () => request<any>("/events"),
  getEvent: (slug: string) => request<any>(`/events/${slug}`),
  getLocations: () => request<any>("/hub-locations"),
  getNewsletters: () => request<any>("/newsletters"),
};

