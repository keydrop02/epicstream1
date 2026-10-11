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
    <div className="container max-w-screen-2xl space-y-6 px-4 py-8 sm:px-6 lg:px-10">
      <h1 className="text-2xl font-bold sm:text-3xl">Schedule</h1>
      <Suspense fallback={null}>
        <ScheduleView matches={matches} sports={sports} live={live} />
      </Suspense>
    </div>
  );
}
