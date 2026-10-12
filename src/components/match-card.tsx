import Link from "next/link";
import { LocalTime } from "@/components/local-time";
import { categoryName, isLive as computeIsLive, matchSlug, posterUrl } from "@/lib/format";
import { SITE_NAME } from "@/lib/site";
import type { Match } from "@/lib/types";
import { cn } from "@/lib/utils";

export function MatchCard({
  match,
  live,
  className,
}: {
  match: Match;
  live?: boolean;
  className?: string;
}) {
  const isLiveMatch = live ?? computeIsLive(match.date);

  return (
    <Link
      href={`/watch/${matchSlug(match)}`}
      aria-label={`${match.title} — ${categoryName(match.category)}`}
      className={cn(
        "group block overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-white/20 md:relative md:aspect-video",
        className,
      )}
    >
      <div className="relative aspect-video overflow-hidden bg-secondary md:absolute md:inset-0 md:aspect-auto">
        {match.poster ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={posterUrl(match.poster)}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-secondary to-card">
            <span className="text-2xl font-bold tracking-tight text-muted-foreground/40 sm:text-4xl">
              {SITE_NAME}
            </span>
          </div>
        )}

        <div className="absolute inset-0 hidden bg-gradient-to-t from-black/85 via-black/20 to-transparent md:block" />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          {isLiveMatch ? (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" aria-hidden />
              Live
            </span>
          ) : (
            <span aria-hidden />
          )}
          <span className="hidden rounded-md bg-black/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/85 backdrop-blur-sm md:inline-flex">
            <LocalTime ts={match.date} />
          </span>
        </div>
      </div>

      <div className="p-3 md:absolute md:inset-x-0 md:bottom-0">
        <p className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-ink md:min-h-0 md:text-white">
          {match.title}
        </p>
        <p className="mt-1 text-xs text-muted-foreground md:hidden">
          <LocalTime ts={match.date} />
        </p>
      </div>
    </Link>
  );
}
