import { Suspense } from "react";
import { ScheduleView } from "@/components/schedule-view";
import { getAllMatches, getLiveMatches, getSports } from "@/lib/api";

export const revalidate = 30;

export const metadata = {
  title: "Schedule",
  description: "Full schedule of live sport events on EpicStream.",
};

export default async function SchedulePage() {
  const [matches, sports, live] = await Promise.all([
    getAllMatches(),
    getSports(),
    getLiveMatches(),
  ]);

  return (
    <div className="mx-auto w-full max-w-screen-2xl space-y-8 px-3 py-10 sm:px-4 lg:px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every upcoming match, grouped by day.
        </p>
      </div>
      <Suspense fallback={null}>
        <ScheduleView matches={matches} sports={sports} live={live} />
      </Suspense>
    </div>
  );
}
