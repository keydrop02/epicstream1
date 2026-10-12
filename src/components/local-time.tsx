"use client";

import { useIsClient } from "@/components/use-is-client";
import { formatTimeClient, formatTimeServer } from "@/lib/format";

export function LocalTime({ ts, className }: { ts: number; className?: string }) {
  const isClient = useIsClient();
  return (
    <time dateTime={new Date(ts).toISOString()} suppressHydrationWarning className={className}>
      {isClient ? formatTimeClient(ts) : formatTimeServer(ts)}
    </time>
  );
}
