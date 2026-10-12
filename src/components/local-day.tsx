"use client";

import { useIsClient } from "@/components/use-is-client";
import { formatDayClient, formatDayServer } from "@/lib/format";

export function LocalDay({ ts }: { ts: number }) {
  const isClient = useIsClient();
  return (
    <time dateTime={new Date(ts).toISOString()} suppressHydrationWarning>
      {isClient ? formatDayClient(ts) : formatDayServer(ts)}
    </time>
  );
}
