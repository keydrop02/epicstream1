import { cache } from "react";
import type { Match, Sport, SourceInfo, Stream } from "./types";

export const API_BASE = (process.env.STREAMED_API ?? "https://streamed.pk").replace(/\/$/, "");

const REVALIDATE = Number(process.env.STREAMED_REVALIDATE ?? 30);

export class UpstreamError extends Error {
  constructor(message = "upstream unavailable") {
    super(message);
    this.name = "UpstreamError";
  }
}

async function fetchWithRetry(
  path: string,
  attempts = 4,
  timeoutMs = 15000,
): Promise<Response | null> {
  const url = `${API_BASE}${path}`;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, {
        headers: { accept: "application/json" },
        next: { revalidate: REVALIDATE },
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (res.ok) return res;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 250 * (i + 1)));
  }
  return null;
}

async function getJson<T>(path: string, attempts = 4, timeoutMs = 15000): Promise<T | null> {
  const res = await fetchWithRetry(path, attempts, timeoutMs);
  if (!res) return null;
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const getSports = cache(async (): Promise<Sport[]> => {
  return (await getJson<Sport[]>("/api/sports", 1, 6000)) ?? [];
});

export const getAllMatches = cache(async (): Promise<Match[]> => {
  return (await getJson<Match[]>("/api/matches/all")) ?? [];
});

export const getAllMatchesStrict = cache(async (): Promise<Match[]> => {
  const matches = await getJson<Match[]>("/api/matches/all");
  if (matches === null) throw new UpstreamError();
  return matches;
});

export const getLiveMatches = cache(async (): Promise<Match[]> => {
  return (await getJson<Match[]>("/api/matches/live")) ?? [];
});

export const getMatchStreams = cache(async (source: string, id: string): Promise<Stream[]> => {
  return (
    (await getJson<Stream[]>(
      `/api/stream/${encodeURIComponent(source)}/${encodeURIComponent(id)}`,
    )) ?? []
  );
});

export const getMatchById = cache(async (id: string): Promise<Match | null> => {
  const matches = await getAllMatches();
  return matches.find((m) => m.id === id) ?? null;
});

export const getStreamsForMatch = cache(
  async (match: Match): Promise<Array<{ source: string; streams: Stream[] }>> => {
    const groups = await Promise.all(
      match.sources.map(async (s) => ({
        source: s.source,
        streams: await getMatchStreams(s.source, s.id),
      })),
    );
    return groups.filter((g) => g.streams.length > 0);
  },
);

export const SOURCE_INFO: Record<string, SourceInfo> = {
  admin: { source: "admin", label: "Admin" },
  alpha: { source: "alpha", label: "Alpha" },
  bravo: { source: "bravo", label: "Bravo" },
  charlie: { source: "charlie", label: "Charlie" },
  delta: { source: "delta", label: "Delta" },
  echo: { source: "echo", label: "Echo" },
  foxtrot: { source: "foxtrot", label: "Foxtrot" },
  golf: { source: "golf", label: "Golf" },
  hotel: { source: "hotel", label: "Hotel" },
  intel: { source: "intel", label: "Intel" },
};

export function sourceLabel(source: string): string {
  return SOURCE_INFO[source]?.label ?? source.charAt(0).toUpperCase() + source.slice(1);
}
