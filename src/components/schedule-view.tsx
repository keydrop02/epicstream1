"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronDown } from "lucide-react";
import { MatchCard } from "@/components/match-card";
import { LocalDay } from "@/components/local-day";
import { useMountTime } from "@/components/use-is-client";
import { categoryName } from "@/lib/format";
import type { Match, Sport } from "@/lib/types";
import { cn } from "@/lib/utils";

type Mode = "all" | "popular" | "live";

function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function startOfToday(now: number): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

interface SelectOption {
  value: string;
  label: string;
}

function FilterSelect({
  value,
  onChange,
  label,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  options: SelectOption[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const current = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative w-full sm:w-auto">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        className="flex h-9 w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded-md border border-input bg-background pl-3 pr-2.5 text-sm font-medium shadow-sm transition-colors hover:border-primary/60 focus:outline-none focus:ring-2 focus:ring-ring sm:w-auto sm:min-w-44"
      >
        <span className="truncate">{current?.label ?? ""}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 top-full z-50 mt-1 max-h-72 w-full min-w-[11rem] overflow-y-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg sm:w-auto"
        >
          {options.map((o) => (
            <li key={o.value} role="option" aria-selected={o.value === value}>
              <button
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                  o.value === value && "bg-primary/10 font-semibold text-primary",
                )}
              >
                <span className="truncate">{o.label}</span>
                {o.value === value && <Check className="h-4 w-4 shrink-0" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ScheduleView({
  matches,
  sports,
  live,
}: {
  matches: Match[];
  sports: Sport[];
  live: Match[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSport = searchParams.get("sport");
  const sport = urlSport && sports.some((s) => s.id === urlSport) ? urlSport : "all";
  const [mode, setMode] = useState<Mode>("all");
  const mountTime = useMountTime();

  const liveIds = useMemo(() => new Set(live.map((m) => m.id)), [live]);

  function changeSport(value: string) {
    router.replace(value === "all" ? "/schedule" : `/schedule?sport=${value}`, {
      scroll: false,
    });
  }

  const filtered = useMemo(() => {
    const cutoff = mountTime === null ? null : startOfToday(mountTime);
    return matches
      .filter((m) => (mode === "live" ? true : cutoff === null ? true : m.date >= cutoff))
      .filter((m) => (sport === "all" ? true : m.category === sport))
      .filter((m) => {
        if (mode === "popular") return m.popular;
        if (mode === "live") return liveIds.has(m.id);
        return true;
      })
      .sort((a, b) => a.date - b.date);
  }, [matches, sport, mode, mountTime, liveIds]);

  const groups = useMemo(() => {
    const map = new Map<string, Match[]>();
    for (const m of filtered) {
      const key = dayKey(m.date);
      const list = map.get(key) ?? [];
      list.push(m);
      map.set(key, list);
    }
    return Array.from(map.values());
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="inline-grid w-auto grid-cols-3 self-start rounded-md border border-border p-1">
          {(["all", "popular", "live"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "rounded px-2 py-1.5 text-sm font-semibold capitalize transition-colors min-w-14 sm:min-w-20 sm:px-3",
                mode === m ? "bg-primary text-primary-foreground" : "hover:bg-accent",
              )}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="min-w-0 flex-1 sm:flex-none">
          <FilterSelect
            value={sport}
            onChange={changeSport}
            label="Filter by sport"
            options={[
              { value: "all", label: "All Sports" },
              ...sports.map((s) => ({ value: s.id, label: categoryName(s.id) })),
            ]}
          />
        </div>
      </div>

      {groups.length === 0 && (
        <p className="py-16 text-center text-muted-foreground">No matches match your filters.</p>
      )}

      {groups.map((group) => (
        <section key={dayKey(group[0].date)} className="space-y-2">
          <h2 className="py-2 text-lg font-bold">
            <LocalDay ts={group[0].date} />
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {group.map((m) => (
              <MatchCard key={`${m.id}-${m.date}`} match={m} live={liveIds.has(m.id)} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
