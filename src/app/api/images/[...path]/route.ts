import { API_BASE } from "@/lib/api";

export const dynamic = "force-dynamic";

const PREFIX = "/api/images/";

const SAFE_SEGMENT = /^[a-zA-Z0-9+_=-][a-zA-Z0-9._+=-]*$/;

const RETRY_DELAYS_MS = [250, 500];

const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"><rect width="640" height="360" fill="#141414"/><text x="320" y="180" fill="#2f2f2f" font-family="system-ui, sans-serif" font-size="28" text-anchor="middle" dominant-baseline="middle">EpicStream</text></svg>`;

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

  const upstreamPath = segments.map((s) => encodeURIComponent(s)).join("/");
  const url = `${API_BASE}/api/images/${upstreamPath}`;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      const res = await fetch(url, {
        cache: "force-cache",
        signal: AbortSignal.timeout(20000),
      });
      if (res.ok || res.status < 500) {
        const headers = new Headers();
        for (const h of ["content-type", "content-length", "etag", "last-modified"]) {
          const v = res.headers.get(h);
          if (v) headers.set(h, v);
        }
        headers.set("cache-control", "public, max-age=86400, immutable");
        return new Response(res.body, { status: res.status, headers });
      }
    } catch {
      // transient upstream failure; retry
    }
    if (attempt < RETRY_DELAYS_MS.length) {
      await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[attempt]));
    }
  }

  return new Response(PLACEHOLDER_SVG, {
    status: 200,
    headers: {
      "content-type": "image/svg+xml",
      "cache-control": "public, max-age=120",
    },
  });
}