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
    <div className="container max-w-screen-2xl space-y-6 px-4 py-8 sm:px-6 lg:px-10">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Multi Stream</h1>
        <p className="text-muted-foreground">Watch up to 4 live streams at once.</p>
      </div>
      <MultiviewBoard matches={matches} live={live} sports={sports} />
    </div>
  );
}
