import { proxyJson } from "@/lib/proxy";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const SAFE_SEGMENT = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  if (!rateLimit(request, 60)) {
    return Response.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders() });
  }

  const { path } = await params;
  if (!path.every((s) => SAFE_SEGMENT.test(s))) {
    return Response.json({ error: "invalid_path" }, { status: 400 });
  }

  return proxyJson(`/api/stream/${path.map(encodeURIComponent).join("/")}`);
}