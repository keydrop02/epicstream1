"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  const id = setInterval(callback, 1000);
  return () => clearInterval(id);
}

function getSnapshot(): number | null {
  return Math.floor(Date.now() / 1000) * 1000;
}

function getServerSnapshot(): number | null {
  return null;
}

function formatParts(diff: number): string {
  const total = Math.max(0, Math.floor(diff / 1000));
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  if (d > 0) return `${d}d ${pad(h)}h ${pad(m)}m ${pad(s)}s`;
  return `${pad(h)} H : ${pad(m)} M : ${pad(s)} S`;
}

export function CountdownTimer({ to, className }: { to: number; className?: string }) {
  const now = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const label = (
    <span className="mr-0 text-sm font-semibold uppercase tracking-widest text-muted-foreground sm:mr-3">
      Event Starts In
    </span>
  );

  if (now === null) {
    return (
      <div className={className}>
        {label}
        <span className="tabular-nums tracking-wide">--</span>
      </div>
    );
  }

  const diff = to - now;
  if (diff <= 0) return null;

  return (
    <div className={className}>
      {label}
      <span className="tabular-nums tracking-wide">{formatParts(diff)}</span>
    </div>
  );
}
