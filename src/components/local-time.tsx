"use client";

import { useIsClient } from "@/components/use-is-client";
import { formatTimeClient } from "@/lib/format";

export function LocalTime({ ts, className }: { ts: number; className?: string }) {
  const isClient = useIsClient();
  return (
    <span className={className} suppressHydrationWarning>
      {isClient ? formatTimeClient(ts) : ""}
    </span>
  );
}
