"use client";

import { useEffect, useState } from "react";
import {
  getAllMatchesClient,
  getLiveMatchesClient,
  getSportsClient,
} from "@/lib/client-api";
import type { Match, Sport } from "@/lib/types";

export function useMatchesData() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [live, setLive] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [s, m, l] = await Promise.all([
          getSportsClient(),
          getAllMatchesClient(),
          getLiveMatchesClient(),
        ]);
        if (cancelled) return;
        setSports(s);
        setMatches(m);
        setLive(l);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { sports, matches, live, loading, error };
}