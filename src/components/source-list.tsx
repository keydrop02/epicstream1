"use client";

import { Globe } from "lucide-react";
import { sourceLabel } from "@/lib/api";
import type { Stream } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface StreamGroup {
  source: string;
  streams: Stream[];
}

export function SourceList({
  groups,
  heading = "Available Sources",
  activeStream,
  onSelect,
  isAdded,
}: {
  groups: StreamGroup[];
  heading?: string | null;
  activeStream?: Stream | null;
  onSelect?: (stream: Stream) => void;
  isAdded?: (stream: Stream) => boolean;
}) {
  return (
    <div className="space-y-4">
      {heading ? <div className="text-base font-semibold text-foreground">{heading}</div> : null}
      <div className="space-y-4">
        {groups.map((g) => (
          <div
            key={g.source}
            className={cn(
              "overflow-hidden rounded-xl border bg-card",
              g.source === "admin" ? "border-amber-400/50" : "border-border",
            )}
          >
            <div className="flex items-center justify-between border-b border-border bg-secondary/30 px-3.5 py-2.5">
              <h3 className="text-sm font-semibold text-foreground">{sourceLabel(g.source)}</h3>
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {g.streams.length} {g.streams.length === 1 ? "stream" : "streams"}
              </span>
            </div>

            <div className="space-y-1.5 p-2">
              {g.streams.map((s) => {
                const active = isAdded ? isAdded(s) : activeStream?.embedUrl === s.embedUrl;
                return (
                  <button
                    key={`${s.id}-${s.streamNo}`}
                    type="button"
                    onClick={onSelect ? () => onSelect(s) : undefined}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                      active
                        ? "border-primary/60 bg-primary/10"
                        : "border-transparent bg-secondary/30 hover:border-border hover:bg-accent",
                      !onSelect && "cursor-default",
                    )}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <span
                        className={cn(
                          "inline-flex shrink-0 items-center justify-center rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                          s.hd
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground",
                        )}
                      >
                        {s.hd ? "HD" : "SD"}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">
                        Stream {s.streamNo}
                      </span>
                      <span className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                        <Globe className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{s.language}</span>
                      </span>
                    </div>
                    <span
                      aria-hidden
                      className={cn(
                        "h-2 w-2 shrink-0 rounded-full",
                        active ? "bg-primary" : "bg-transparent",
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
