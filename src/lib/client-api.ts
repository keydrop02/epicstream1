import type { Match, Sport, Stream } from "./types";
import { matchSlug, slugify } from "./format";

export interface StreamGroup {
  source: string;
  streams: Stream[];
}

const TTL = {
  sports: 60_000,
  matches: 30_000,
  live: 15_000,
  streams: 30_000,
};

interface Entry<T> {
  value: T | null;
  until: number;
}

const cache = new Map<string, Entry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

async function fetchJson<T>(path: string, ttlMs: number): Promise<T | null> {
  const now = Date.now();
  const hit = cache.get(path);
  if (hit && now < hit.until) return hit.value as T | null;

  const pending = inflight.get(path);
  if (pending) {
    try {
      return (await pending) as T;
    } catch {
      // fall through and retry
    }
  }

  const promise = (async () => {
    try {
      const res = await fetch(path, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) return null;
      return (await res.json()) as T;
    } catch {
      return null;
    }
  })();

  inflight.set(path, promise);
  try {
    const value = (await promise) as T | null;
    cache.set(path, { value, until: Date.now() + ttlMs });
    return value;
  } finally {
    inflight.delete(path);
  }
}

export async function getSportsClient(): Promise<Sport[]> {
  return (await fetchJson<Sport[]>("/api/sports", TTL.sports)) ?? [];
}

export async function getAllMatchesClient(): Promise<Match[]> {
  return (await fetchJson<Match[]>("/api/matches/all", TTL.matches)) ?? [];
}

export async function getLiveMatchesClient(): Promise<Match[]> {
  return (await fetchJson<Match[]>("/api/matches/live", TTL.live)) ?? [];
}

export function groupStreamsBySource(streams: Stream[]): StreamGroup[] {
  const map = new Map<string, Stream[]>();
  for (const s of streams) {
    const list = map.get(s.source) ?? [];
    list.push(s);
    map.set(s.source, list);
  }
  return Array.from(map.entries()).map(([source, list]) => ({ source, streams: list }));
}

export async function getStreamsForMatchClient(match: Match): Promise<StreamGroup[]> {
  const lists = await Promise.all(
    match.sources.map(async (s) => {
      const streams = await fetchJson<Stream[]>(
        `/api/stream/${encodeURIComponent(s.source)}/${encodeURIComponent(s.id)}`,
        TTL.streams,
      );
      return streams ?? [];
    }),
  );
  return groupStreamsBySource(lists.flat()).filter((g) => g.streams.length > 0);
}

function slugTokens(s: string): string[] {
  return s.split("-").filter((t) => t.length > 1);
}

export async function matchFromSlugClient(slugId: string): Promise<Match | null> {
  const matches = await getAllMatchesClient();

  const direct = matches.find((m) => m.id === slugId);
  if (direct) return direct;

  const trailing = slugId.match(/(\d+)$/)?.[1];
  if (trailing) {
    const byId = matches.find((m) => m.id === trailing);
    if (byId) return byId;
  }

  const base = slugId.replace(/-\d+$/, "");
  const exact =
    matches.find((m) => m.id === slugId) ??
    matches.find((m) => matchSlug(m) === slugId) ??
    matches.find((m) => slugify(m.title) === base) ??
    matches.find((m) => slugify(m.title) === slugId) ??
    matches.find((m) => m.id.endsWith(`-${base}`));
  if (exact) return exact;

  const want = slugTokens(base);
  if (want.length >= 2) {
    const candidates = matches.filter((m) => {
      const have = new Set(slugTokens(slugify(m.title)));
      return want.every((t) => have.has(t));
    });
    if (candidates.length === 1) return candidates[0];
  }

  return null;
}