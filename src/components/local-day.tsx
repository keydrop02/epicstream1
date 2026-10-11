"use client";

import { useIsClient } from "@/components/use-is-client";
import { formatDayClient } from "@/lib/format";

export function LocalDay({ ts }: { ts: number }) {
  const isClient = useIsClient();
  return <span suppressHydrationWarning>{isClient ? formatDayClient(ts) : ""}</span>;
}
