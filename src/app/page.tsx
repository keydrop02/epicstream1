"use client";

import { Carousel } from "@/components/carousel";
import { MatchCard } from "@/components/match-card";
import { SectionHeader } from "@/components/section-header";
import { categoryName } from "@/lib/format";
import { SITE_NAME } from "@/lib/site";
import { useMatchesData } from "@/lib/use-matches-data";
import type { Match } from "@/lib/types";

const slideClass =
  "min-w-0 shrink-0 basis-[calc(50%-0.5rem)] md:basis-[calc(42%-0.5rem)] lg:basis-[calc(31%-0.5rem)] xl:basis-[calc(23.5%-0.5rem)]";

function CardRail({ matches, live }: { matches: Match[]; live: Match[] }) {
  const liveIds = new Set(live.map((m) => m.id));
  return (
    <Carousel>
      {matches.map((m) => (
        <div key={`${m.id}-${m.date}`} className={slideClass}>
          <MatchCard match={m} live={liveIds.has(m.id)} />
        </div>
      ))}
    </Carousel>
  );
}

export default function HomePage() {
  const { sports, matches, live, loading } = useMatchesData();

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-screen-2xl px-3 py-20 text-center text-sm text-muted-foreground sm:px-4 lg:px-6">
        Loading matches…
      </div>
    );
  }

  const byCategory = sports
    .map((s) => ({ sport: s, matches: matches.filter((m) => m.category === s.id) }))
    .filter((group) => group.matches.length > 0);

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-3 py-8 sm:px-4 lg:px-6">
      <h1 className="sr-only">{SITE_NAME} — Watch Live Sports Online Free</h1>
      <div className="space-y-5 pb-4">
        <section>
          <SectionHeader
            title="Popular Live"
            href="/schedule"
            badge={
              <span className="inline-flex items-center gap-1.5 rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" aria-hidden />
                Live
              </span>
            }
          />
          {live.length > 0 ? (
            <CardRail matches={live} live={live} />
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No live matches right now.
            </p>
          )}
        </section>

        {byCategory.map((group) => (
          <section key={group.sport.id}>
            <SectionHeader
              title={categoryName(group.sport.id)}
              href={`/schedule?sport=${group.sport.id}`}
            />
            <CardRail matches={group.matches} live={live} />
          </section>
        ))}
      </div>

      {matches.length === 0 && (
        <p className="py-20 text-center text-muted-foreground">
          No matches are available right now. Please try again later.
        </p>
      )}
    </div>
  );
}