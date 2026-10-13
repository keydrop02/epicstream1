import { API_BASE } from "./api";

const REVALIDATE = Number(process.env.STREAMED_REVALIDATE ?? 30);

export async function proxyJson(path: string): Promise<Response> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        headers: { accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      });
      if (res.status >= 500) {
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
          continue;
        }
        break;
      }
      const body = await res.text();
      return new Response(body, {
        status: res.status,
        headers: {
          "content-type": "application/json",
          "cache-control": `public, s-maxage=${REVALIDATE}, stale-while-revalidate=${REVALIDATE * 2}`,
        },
      });
    } catch {
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
      } else {
        break;
      }
    }
  }
  return Response.json({ error: "upstream_unavailable" }, { status: 502 });
}
