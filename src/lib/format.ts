export const CATEGORY_NAMES: Record<string, string> = {
  basketball: "Basketball",
  football: "Football",
  "american-football": "American Football",
  hockey: "Hockey",
  baseball: "Baseball",
  "motor-sports": "Motor Sports",
  fight: "Fight (UFC, Boxing)",
  tennis: "Tennis",
  rugby: "Rugby",
  golf: "Golf",
  billiards: "Billiards",
  afl: "AFL",
  darts: "Darts",
  cricket: "Cricket",
  other: "Other",
};

export function categoryName(id: string): string {
  return CATEGORY_NAMES[id] ?? id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function posterUrl(poster?: string | null): string {
  if (!poster) return "/api/images/poster/fallback.webp";
  if (poster.startsWith("http")) return poster;
  return poster.startsWith("/") ? poster : `/${poster}`;
}

export function safeEmbedUrl(url?: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function matchSlug(match: { id: string; title: string }): string {
  const s = slugify(match.title);
  if (!s) return match.id;
  if (match.id === s) return s;
  if (match.id.endsWith(`-${s}`)) return match.id;
  const numericId = match.id.match(/(\d+)$/)?.[1];
  if (numericId) return `${s}-${numericId}`;
  if (match.id.includes(s)) return match.id;
  return `${s}-${match.id}`;
}

export function isLive(date: number, now = Date.now()): boolean {
  const start = date;
  const end = date + 3 * 60 * 60 * 1000;
  return now >= start && now < end;
}

export function formatTimeClient(ts: number): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(ts));
}

export function formatTimeServer(ts: number): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(new Date(ts));
}

export function formatDayServer(ts: number): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(ts));
}

export function formatDayClient(ts: number): string {
  const d = new Date(ts);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const same = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (same(d, today)) return "Today";
  if (same(d, tomorrow)) return "Tomorrow";
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(d);
}
