import { API_BASE } from "./api";

const REVALIDATE = Number(process.env.STREAMED_REVALIDATE ?? 30);

export async function proxyJson(path: string): Promise<Response> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { accept: "application/json" },
      next: { revalidate: REVALIDATE },
      signal: AbortSignal.timeout(15000),
    });
    const body = await res.text();
    return new Response(body, {
      status: res.status,
      headers: {
        "content-type": "application/json",
        "cache-control": `public, s-maxage=${REVALIDATE}, stale-while-revalidate=${REVALIDATE * 2}`,
      },
    });
  } catch {
    return Response.json({ error: "upstream_unavailable" }, { status: 502 });
  }
}
