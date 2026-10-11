"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { categoryName, matchSlug, posterUrl } from "@/lib/format";
import type { Match } from "@/lib/types";

export function SearchDialog({ onClose }: { onClose: () => void }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl">
        <div className="flex items-center border-b border-border px-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search matches..."
            className="h-12 w-full bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {loading && <p className="p-4 text-sm text-muted-foreground">Loading matches...</p>}
          {!loading && results.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">No matches found.</p>
          )}
          {results.map((m) => (
            <Link
              key={m.id}
              href={`/watch/${matchSlug(m)}`}
              onClick={onClose}
              className="flex items-center gap-3 rounded-md p-2 hover:bg-accent"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={posterUrl(m.poster)} alt="" className="h-10 w-16 rounded object-cover" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{m.title}</span>
                <span className="block text-xs text-muted-foreground">
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
