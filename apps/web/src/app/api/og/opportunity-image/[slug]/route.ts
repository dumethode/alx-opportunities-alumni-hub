import type { NextRequest } from "next/server";

const fallbackPath = "/media/placeholders/opportunity-default.jpg";

function apiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";
}

function apiOrigin() {
  return apiBaseUrl().replace(/\/api\/v1$/, "");
}

async function fetchWithTimeout(url: string, init?: RequestInit, timeoutMs = 9000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const fallbackUrl = new URL(fallbackPath, request.url);

  async function serveFallback(): Promise<Response> {
    try {
      const res = await fetchWithTimeout(fallbackUrl.toString(), { cache: "force-cache" }, 8000);
      const body = await res.arrayBuffer();
      const contentType = res.headers.get("content-type") ?? "image/jpeg";
      return new Response(body, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      });
    } catch {
      return new Response("", { status: 404 });
    }
  }

  try {
    const oppRes = await fetchWithTimeout(
      `${apiBaseUrl()}/opportunities/${encodeURIComponent(slug)}?track_view=false`,
      { cache: "no-store" },
    );
    if (!oppRes.ok) {
      return await serveFallback();
    }

    const payload = (await oppRes.json()) as any;
    const imageUrl = payload?.item?.image_url as string | null | undefined;
    const resolved =
      imageUrl && imageUrl.startsWith("http") ? imageUrl : imageUrl ? `${apiOrigin()}${imageUrl}` : null;

    if (!resolved) {
      return await serveFallback();
    }

    const imgRes = await fetchWithTimeout(resolved, { cache: "force-cache" }, 12000);
    if (!imgRes.ok) {
      return await serveFallback();
    }

    const contentType = imgRes.headers.get("content-type") ?? "image/jpeg";
    const body = await imgRes.arrayBuffer();
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        // Cache at the edge so WhatsApp can fetch quickly and reliably.
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return await serveFallback();
  }
}
