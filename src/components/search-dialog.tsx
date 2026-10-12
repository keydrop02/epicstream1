"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { categoryName, isLive, matchSlug, posterUrl } from "@/lib/format";
import type { Match } from "@/lib/types";

export function SearchDialog({ onClose }: { onClose: () => void }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 50);

    const controller = new AbortController();
    fetch("/api/matches/all", { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setMatches(Array.isArray(data) ? data : []))
      .catch(() => setMatches([]))
      .finally(() => setLoading(false));

    return () => {
      document.removeEventListener("keydown", onKey);
      clearTimeout(focusTimer);
      controller.abort();
    };
  }, [onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return matches.slice(0, 12);
    return matches.filter((m) => m.title.toLowerCase().includes(q)).slice(0, 30);
  }, [matches, query]);

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[10vh]">
      <button
        type="button"
        aria-label="Close search"
        onClick={onClose}
        className="absolute inset-0 cursor-pointer bg-black/70 backdrop-blur-sm"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Search matches"
        className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl shadow-black/60 outline-none"
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search matches…"
            className="h-14 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {loading && <p className="p-4 text-sm text-muted-foreground">Loading matches…</p>}
          {!loading && results.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">No matches found.</p>
          )}
          {results.map((m) => (
            <Link
              key={m.id}
              href={`/watch/${matchSlug(m)}`}
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={posterUrl(m.poster)}
                alt=""
                className="h-11 w-[4.5rem] rounded-md object-cover"
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-sm">
                  <span className="min-w-0 truncate text-sm font-semibold">{m.title}</span>
                  {isLive(m.date) ? (
                    <span className="inline-flex shrink-0 items-center gap-[0.4em] rounded-md bg-primary px-[0.6em] py-[0.15em] text-[0.7em] font-bold uppercase tracking-wider text-primary-foreground">
                      <span className="h-[0.4em] w-[0.4em] animate-pulse rounded-full bg-white" aria-hidden />
                      Live
                    </span>
                  ) : null}
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {categoryName(m.category)}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
