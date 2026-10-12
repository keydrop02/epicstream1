const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;

const buckets = new Map<string, number[]>();

let lastSweep = 0;

function sweep(now: number) {
  if (now - lastSweep < WINDOW_MS) return;
  lastSweep = now;
  for (const [key, times] of buckets) {
    const kept = times.filter((t) => now - t < WINDOW_MS);
    if (kept.length === 0) buckets.delete(key);
    else buckets.set(key, kept);
  }
}

function clientKey(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export function rateLimit(request: Request, max = MAX_REQUESTS): { ok: boolean } {
  const key = clientKey(request);
  const now = Date.now();
  sweep(now);
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= max) {
    buckets.set(key, hits);
    return { ok: false };
  }
  hits.push(now);
  buckets.set(key, hits);
  return { ok: true };
}

export function rateLimitHeaders(): Headers {
  const headers = new Headers();
  headers.set("retry-after", "60");
  headers.set("cache-control", "no-store");
  return headers;
}