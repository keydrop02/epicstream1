import { MultiviewBoard } from "@/components/multiview-board";
import { getAllMatches, getLiveMatches, getSports } from "@/lib/api";

export const revalidate = 30;

export const metadata = {
  title: "Multi Stream",
  description: "Watch multiple live streams at the same time on EpicStream.",
};

export default async function MultiviewPage() {
  const [matches, sports, live] = await Promise.all([
    getAllMatches(),
    getSports(),
    getLiveMatches(),
  ]);

  return (
    <div className="mx-auto w-full max-w-screen-2xl space-y-8 px-3 py-10 sm:px-4 lg:px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Multi Stream</h1>
        <p className="mt-1 text-sm text-muted-foreground">Watch up to 4 live streams at once.</p>
      </div>
      <MultiviewBoard matches={matches} live={live} sports={sports} />
    </div>
  );
}
