import { API_BASE } from "@/lib/api";

export const dynamic = "force-dynamic";

const PREFIX = "/api/images/";

const SAFE_SEGMENT = /^[a-zA-Z0-9+_=-][a-zA-Z0-9._+=-]*$/;

export async function GET(request: Request) {
  const raw = new URL(request.url).pathname;
  const suffix = raw.startsWith(PREFIX) ? raw.slice(PREFIX.length) : "";
  let segments: string[];
  try {
    segments = suffix.split("/").map((s) => decodeURIComponent(s));
  } catch {
    return new Response("invalid path", { status: 400 });
  }
  if (segments.some((s) => s.length === 0 || !SAFE_SEGMENT.test(s))) {
    return new Response("invalid path", { status: 400 });
  }
  try {
    const upstreamPath = segments.map((s) => encodeURIComponent(s)).join("/");
    const res = await fetch(`${API_BASE}/api/images/${upstreamPath}`, {
      cache: "force-cache",
      signal: AbortSignal.timeout(20000),
    });
    const headers = new Headers();
    for (const h of ["content-type", "content-length", "etag", "last-modified"]) {
      const v = res.headers.get(h);
      if (v) headers.set(h, v);
    }
    headers.set("cache-control", "public, max-age=86400, immutable");
    return new Response(res.body, { status: res.status, headers });
  } catch {
    return new Response("upstream unavailable", { status: 502 });
  }
}
