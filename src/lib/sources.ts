import type { SourceInfo } from "./types";

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