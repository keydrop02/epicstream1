"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { StreamsPanel } from "@/components/streams-panel";
import { getStreamsForMatchClient, matchFromSlugClient } from "@/lib/client-api";
import type { StreamGroup } from "@/lib/client-api";
import { matchSlug } from "@/lib/format";
import type { Match } from "@/lib/types";

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "not-found" }
  | { status: "ready"; match: Match; groups: StreamGroup[] };

export function WatchView({
  slugId,
  source,
  streamNo,
}: {
  slugId: string;
  source?: string;
  streamNo?: string;
}) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const match = await matchFromSlugClient(slugId);
        if (cancelled) return;
        if (!match) {
          setState({ status: "not-found" });
          return;
        }
        const groups = await getStreamsForMatchClient(match);
        if (cancelled) return;
        setState({ status: "ready", match, groups });
      } catch {
        if (!cancelled) setState({ status: "error" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slugId]);

  const streamsKey = source && streamNo ? `${source}-${streamNo}` : "";

  const initialStream = useMemo(() => {
    if (state.status !== "ready" || !source || !streamNo) return null;
    const n = Number(streamNo);
    const group = state.groups.find((g) => g.source === source);
    return group?.streams.find((s) => s.streamNo === n) ?? null;
  }, [state, source, streamNo]);

  if (state.status === "loading") {
    return (
      <div className="flex h-full w-full items-center justify-center p-6">
        <div className="text-center text-sm text-muted-foreground">Loading stream links…</div>
      </div>
    );
  }

  if (state.status === "error") {
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

  if (state.status === "not-found") {
    return (
      <div className="flex h-full w-full items-center justify-center p-6">
        <div className="max-w-md rounded-lg border border-border bg-secondary/40 p-6 text-center">
          <h1 className="text-lg font-semibold">Match not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This match could not be found. It may have been removed from the schedule.
          </p>
          <Link href="/" className="mt-4 inline-block text-sm text-primary hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <StreamsPanel
      key={streamsKey}
      title={state.match.title}
      groups={state.groups}
      slug={matchSlug(state.match)}
      startsAt={state.match.date}
      initialStream={initialStream}
    />
  );
}