import { proxyJson } from "@/lib/proxy";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const SAFE_SEGMENT = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  if (!rateLimit(request)) {
    return Response.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders() });
  }

  const { path } = await params;
  const segments = path ?? [];
  if (segments.length > 1 || (segments.length === 1 && !SAFE_SEGMENT.test(segments[0]))) {
    return Response.json({ error: "invalid_path" }, { status: 400 });
  }

  const suffix =
    segments.length > 0 ? `/${segments.map(encodeURIComponent).join("/")}` : "";
  return proxyJson(`/api/matches${suffix}`);
}