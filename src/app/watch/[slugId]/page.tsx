import type { Metadata } from "next";
import { WatchView, matchFromSlug } from "@/components/watch-view";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slugId: string }>;
}): Promise<Metadata> {
  const { slugId } = await params;
  const match = await matchFromSlug(slugId).catch(() => null);
  if (!match) return { title: "Watch" };
  return {
    title: `Watch ${match.title} Stream Links`,
    description: `Watch ${match.title} online for free on EpicStream.`,
  };
}

export default async function WatchPage({ params }: { params: Promise<{ slugId: string }> }) {
  const { slugId } = await params;
  return <WatchView slugId={slugId} />;
}