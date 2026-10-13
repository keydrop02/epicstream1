"use client";

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Skeleton, TextSkeleton } from "@/components/skeleton";
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
      <div className="mx-auto w-full max-w-4xl space-y-6 px-3 py-6">
        <div className="space-y-3 text-center">
          <TextSkeleton className="mx-auto h-8 w-64" />
          <TextSkeleton className="mx-auto h-4 w-80" />
        </div>
        <Skeleton className="aspect-video w-full" />
        <div className="space-y-3">
          <TextSkeleton className="h-6 w-48" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <TextSkeleton className="h-4 w-24" />
                  <TextSkeleton className="h-3.5 w-16" />
                </div>
                <div className="mt-3 flex gap-2">
                  <TextSkeleton className="h-9 w-24" />
                  <TextSkeleton className="h-9 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
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