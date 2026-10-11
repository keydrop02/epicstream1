import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { LocalTime } from "@/components/local-time";
import { categoryName, isLive as computeIsLive, matchSlug, posterUrl } from "@/lib/format";
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
      className={cn("group block w-full rounded-lg transition-all", className)}
    >
      <div className="relative h-auto overflow-hidden rounded-lg border border-border/40 bg-secondary">
        {match.poster ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={posterUrl(match.poster)}
              alt={`${match.title} poster`}
              loading="lazy"
              className="z-[-10] aspect-video w-full rounded-lg object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </>
        ) : (
          <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-gradient-to-br from-secondary to-primary/10 transition-colors duration-500 group-hover:to-primary/20">
            <span className="text-xl font-extrabold tracking-tight text-muted-foreground">
              EpicStream
            </span>
          </div>
        )}
        {isLiveMatch && (
          <Badge variant="live" className="absolute left-2 top-2 gap-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" aria-hidden />
            LIVE
          </Badge>
        )}
      </div>
      <div className="relative flex items-center gap-4 py-4">
        <div className="min-w-0 flex-grow">
          <h1 title={match.title} className="line-clamp-2 break-words text-sm font-bold sm:text-base">
            {match.title}
          </h1>
          <p className="text-sm text-muted-foreground/70 sm:text-base">
            <span className="font-semibold">{categoryName(match.category)}</span>{" "}
            <span>
              | <LocalTime ts={match.date} />
            </span>
          </p>
        </div>
      </div>
    </Link>
  );
}
