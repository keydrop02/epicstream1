"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, LayoutGrid, Rows2, Search, Square, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SourceList } from "@/components/source-list";
import { categoryName } from "@/lib/format";
import type { Match, Sport, Stream } from "@/lib/types";
import { cn } from "@/lib/utils";

type Layout = 1 | 2 | 4;

interface Slot {
  key: string;
  title: string;
  embedUrl: string;
}

function groupStreams(streams: Stream[]): Array<{ source: string; streams: Stream[] }> {
  const map = new Map<string, Stream[]>();
  for (const s of streams) {
    const list = map.get(s.source) ?? [];
    list.push(s);
    map.set(s.source, list);
  }
  return Array.from(map.entries()).map(([source, list]) => ({ source, streams: list }));
}

export function MultiviewBoard({
  matches,
  live,
  sports,
}: {
  matches: Match[];
  live: Match[];
  sports: Sport[];
}) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [layout, setLayout] = useState<Layout>(4);
  const [picking, setPicking] = useState(false);

  const add = (match: Match, stream: Stream) => {
    const key = `${match.id}:${stream.streamNo}`;
    setSlots((prev) => {
      if (prev.some((s) => s.key === key)) return prev;
      const next = [...prev, { key, title: match.title, embedUrl: stream.embedUrl }];
      return next.slice(0, 4);
    });
  };

  const remove = (key: string) => setSlots((prev) => prev.filter((s) => s.key !== key));

  const addedKeys = useMemo(() => new Set(slots.map((s) => s.key)), [slots]);

  const gridClass =
    layout === 1
      ? "grid-cols-1"
      : layout === 2
        ? "grid-cols-1 md:grid-cols-2"
        : "grid-cols-1 md:grid-cols-2";

  const visible = slots.slice(0, layout);
  const placeholders = Math.max(0, layout - visible.length);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-md border border-border p-1">
          {(
            [
              { v: 1, icon: Square, label: "1" },
              { v: 2, icon: Rows2, label: "2" },
              { v: 4, icon: LayoutGrid, label: "4" },
            ] as const
          ).map(({ v, icon: Icon, label }) => (
            <button
              key={v}
              onClick={() => setLayout(v)}
              className={cn(
                "flex items-center gap-1 rounded px-3 py-1.5 text-sm font-semibold transition-colors",
                layout === v ? "bg-primary text-primary-foreground" : "hover:bg-accent",
              )}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>
        {slots.length > 0 && (
          <Button variant="outline" className="ml-auto" onClick={() => setSlots([])}>
            Clear all
          </Button>
        )}
      </div>

      <div className={cn("grid gap-3", gridClass)}>
        {visible.map((slot) => (
          <div
            key={slot.key}
            className="group relative aspect-video overflow-hidden rounded-xl border border-border bg-black"
          >
            <button
              onClick={() => remove(slot.key)}
              className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
              aria-label="Remove stream"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="pointer-events-none absolute left-0 top-0 z-10 max-w-[85%] bg-gradient-to-r from-black/80 to-transparent px-3 py-2 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="truncate text-sm font-semibold text-white">{slot.title}</div>
            </div>
            <iframe
              src={slot.embedUrl}
              title={slot.title}
              allowFullScreen
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              className="h-full w-full"
            />
          </div>
        ))}
        {Array.from({ length: placeholders }).map((_, i) => (
          <button
            key={`ph-${i}`}
            type="button"
            onClick={() => setPicking(true)}
            className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-sm text-muted-foreground transition-colors hover:bg-accent"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-current text-2xl leading-none opacity-80">
              +
            </span>
            Click to add stream
          </button>
        ))}
      </div>

      {picking && (
        <AddStreamModal
          matches={matches}
          live={live}
          sports={sports}
          addedKeys={addedKeys}
          onClose={() => setPicking(false)}
          onPick={(match, stream) => {
            add(match, stream);
            setPicking(false);
          }}
        />
      )}
    </div>
  );
}

function AddStreamModal({
  matches,
  live,
  sports,
  addedKeys,
  onClose,
  onPick,
}: {
  matches: Match[];
  live: Match[];
  sports: Sport[];
  addedKeys: Set<string>;
  onClose: () => void;
  onPick: (match: Match, stream: Stream) => void;
}) {
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState<string | null>(null);
  const [openMatch, setOpenMatch] = useState<string | null>(null);
  const [streamsByMatch, setStreamsByMatch] = useState<Record<string, Stream[] | "loading">>({});

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const q = query.trim().toLowerCase();
  const searching = q.length > 0;

  const filtered = useMemo(() => {
    if (searching) {
      return matches.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          categoryName(m.category).toLowerCase().includes(q),
      );
    }
    if (sport) return matches.filter((m) => m.category === sport);
    return live;
  }, [matches, live, q, searching, sport]);

  const heading = searching ? "Search Results" : sport ? categoryName(sport) : null;

  const loadStreams = async (match: Match) => {
    setStreamsByMatch((prev) => ({ ...prev, [match.id]: "loading" }));
    const lists = await Promise.all(
      match.sources.map(async (s) => {
        try {
          const res = await fetch(
            `/api/stream/${encodeURIComponent(s.source)}/${encodeURIComponent(s.id)}`,
          );
          if (!res.ok) return [];
          return (await res.json()) as Stream[];
        } catch {
          return [];
        }
      }),
    );
    setStreamsByMatch((prev) => ({ ...prev, [match.id]: lists.flat() }));
  };

  const toggleMatch = (match: Match) => {
    const opening = openMatch !== match.id;
    setOpenMatch(opening ? match.id : null);
    if (opening && !streamsByMatch[match.id]) void loadStreams(match);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-pointer bg-black/60 backdrop-blur-sm"
      />
      <div className="relative z-10 flex w-[min(600px,calc(100%-32px))] flex-col overflow-hidden rounded-lg border border-border bg-background text-foreground shadow-lg">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-1">
            {(sport || openMatch) && (
              <button
                type="button"
                onClick={() => {
                  if (openMatch) setOpenMatch(null);
                  else setSport(null);
                }}
                aria-label="Back"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <ChevronDown className="h-5 w-5 rotate-90" />
              </button>
            )}
            <h2 className="text-lg font-semibold">Add Stream</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a match..."
              className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-muted-foreground"
            />
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {!searching && (
              <>
                <h3 className="mb-3 text-lg font-semibold">Categories</h3>
                <div className="mb-6 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {sports.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSport((prev) => (prev === s.id ? null : s.id))}
                      className={cn(
                        "flex h-20 cursor-pointer flex-col items-center justify-center rounded-lg p-2 text-center text-sm font-medium transition-colors",
                        sport === s.id ? "bg-primary/10 text-primary" : "bg-muted/50 hover:bg-muted",
                      )}
                    >
                      <span className="line-clamp-2">{s.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {heading ? (
              <h3 className="mb-3 text-lg font-semibold">{heading}</h3>
            ) : (
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                Popular Live
                <Badge variant="live" className="gap-1.5">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" aria-hidden />
                  LIVE
                </Badge>
              </h3>
            )}

            <div className="space-y-2">
              {filtered.map((match) => {
                const open = openMatch === match.id;
                const st = streamsByMatch[match.id];
                const groups = Array.isArray(st) ? groupStreams(st) : [];
                return (
                  <div key={match.id} className="rounded-lg border border-border transition-all">
                    <button
                      type="button"
                      onClick={() => toggleMatch(match)}
                      className="flex w-full cursor-pointer items-center justify-between p-3 text-left"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{match.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {categoryName(match.category)}
                        </p>
                      </div>
                      <ChevronDown
                        className={cn(
                          "h-5 w-5 text-muted-foreground transition-transform",
                          open && "rotate-180",
                        )}
                      />
                    </button>
                    {open && (
                      <div className="border-t border-border p-2 md:p-3">
                        {st === "loading" ? (
                          <div className="p-4 text-center">
                            <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            <p className="text-sm text-muted-foreground">Loading streams...</p>
                          </div>
                        ) : groups.length === 0 ? (
                          <p className="py-4 text-center text-muted-foreground">
                            No streams available for this match.
                          </p>
                        ) : (
                          <SourceList
                            groups={groups}
                            heading={null}
                            isAdded={(s) => addedKeys.has(`${match.id}:${s.streamNo}`)}
                            onSelect={(s) => onPick(match, s)}
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <p className="py-8 text-center text-muted-foreground">
                  No matches available for this event.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
