import { Carousel } from "@/components/carousel";
import { MatchCard } from "@/components/match-card";
import { SectionHeader } from "@/components/section-header";
import { getAllMatches, getLiveMatches, getSports } from "@/lib/api";
import { categoryName } from "@/lib/format";
import type { Match } from "@/lib/types";

export const revalidate = 30;

const slideClass =
  "min-w-0 shrink-0 basis-[calc(50%-0.5rem)] md:basis-[calc(33.333%-0.5rem)] lg:basis-[calc(20%-0.5rem)] xl:basis-[calc(16.666%-0.5rem)]";

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

export default async function HomePage() {
  const [sports, all, live] = await Promise.all([getSports(), getAllMatches(), getLiveMatches()]);

  const byCategory = sports
    .map((s) => ({ sport: s, matches: all.filter((m) => m.category === s.id) }))
    .filter((group) => group.matches.length > 0);

  return (
    <div className="container max-w-screen-2xl space-y-1 px-4 py-8 sm:px-6 lg:px-10">
      {live.length > 0 && (
        <section>
          <SectionHeader title="Popular Live" />
          <CardRail matches={live} live={live} />
        </section>
      )}

      {byCategory.map((group) => (
        <section key={group.sport.id}>
          <SectionHeader title={categoryName(group.sport.id)} href={`/schedule?sport=${group.sport.id}`} />
          <CardRail matches={group.matches} live={live} />
        </section>
      ))}

      {all.length === 0 && (
        <p className="py-16 text-center text-muted-foreground">
          No matches are available right now. Please try again later.
        </p>
      )}
    </div>
  );
}
