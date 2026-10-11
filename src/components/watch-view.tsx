import { notFound } from "next/navigation";
import { StreamsPanel } from "@/components/streams-panel";
import {
  UpstreamError,
  getAllMatchesStrict,
  getMatchById,
  getStreamsForMatch,
} from "@/lib/api";
import { matchSlug, slugify } from "@/lib/format";
import type { Match, Stream } from "@/lib/types";

function slugTokens(s: string): string[] {
  return s.split("-").filter((t) => t.length > 1);
}

export async function matchFromSlug(slugId: string): Promise<Match | null> {
  const direct = await getMatchById(slugId);
  if (direct) return direct;

  const trailing = slugId.match(/(\d+)$/)?.[1];
  if (trailing) {
    const byId = await getMatchById(trailing);
    if (byId) return byId;
  }

  const matches = await getAllMatchesStrict();
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

export async function WatchView({
  slugId,
  source,
  streamNo,
}: {
  slugId: string;
  source?: string;
  streamNo?: string;
}) {
  let match: Match | null;
  try {
    match = await matchFromSlug(slugId);
  } catch (err) {
    if (err instanceof UpstreamError) {
      return (
        <div className="flex h-full w-full items-center justify-center p-6">
          <div className="max-w-md rounded-lg border border-border bg-secondary/40 p-6 text-center">
            <h1 className="text-lg font-semibold">Streams are temporarily unavailable</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              We couldn&apos;t reach the streaming service. Please try again in a moment.
            </p>
          </div>
        </div>
      );
    }
    throw err;
  }

  if (!match) notFound();

  const groups = await getStreamsForMatch(match);

  let initialStream: Stream | null = null;
  if (source != null && streamNo != null) {
    const n = Number(streamNo);
    const group = groups.find((g) => g.source === source);
    initialStream = group?.streams.find((s) => s.streamNo === n) ?? null;
  }

  return (
    <StreamsPanel
      key={`${source ?? ""}-${streamNo ?? ""}`}
      title={match.title}
      groups={groups}
      slug={matchSlug(match)}
      startsAt={match.date}
      initialStream={initialStream}
    />
  );
}
