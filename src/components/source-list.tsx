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
      {heading ? <div className="mb-4 text-lg font-semibold text-foreground">{heading}</div> : null}
      <div className="space-y-4">
        {groups.map((g) => (
          <div
            key={g.source}
            className={cn(
              "border rounded-lg overflow-hidden",
              g.source === "admin" ? "border-amber-400/70" : "border-primary/60",
            )}
          >
            <div className="bg-secondary/10 border-b border-border/60 px-2.5 py-1.5 flex justify-between items-center">
              <h3 className="font-bold text-base">{sourceLabel(g.source)}</h3>
              <div className="flex items-center gap-1 rounded-full bg-secondary/50 px-2 py-0.5 text-xs text-muted-foreground">
                {g.streams.length} {g.streams.length === 1 ? "stream" : "streams"}
              </div>
            </div>

            <div className="p-1.5">
              {g.streams.map((s) => {
                const active = isAdded ? isAdded(s) : activeStream?.embedUrl === s.embedUrl;
                return (
                  <button
                    key={`${s.id}-${s.streamNo}`}
                    type="button"
                    onClick={onSelect ? () => onSelect(s) : undefined}
                    className={cn(
                      "transition-all w-full border-border/40 drop-shadow-sm border rounded-md flex p-1.5 mb-1 items-center gap-2 justify-between text-left",
                      active ? "border-primary bg-primary/10" : "hover:border-primary",
                      !onSelect && "cursor-default",
                    )}
                  >
                    <div className="flex flex-1 items-center gap-2 min-w-0">
                      <div className="flex flex-shrink-0 items-center self-center">
                        {s.hd ? (
                          <span className="inline-flex items-center justify-center rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                            HD
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center rounded bg-secondary px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                            SD
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 truncate text-sm font-medium">
                        Stream {s.streamNo}
                      </div>
                      <div className="flex min-w-0 items-center gap-1 text-sm text-muted-foreground">
                        <Globe className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{s.language}</span>
                      </div>
                    </div>
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
