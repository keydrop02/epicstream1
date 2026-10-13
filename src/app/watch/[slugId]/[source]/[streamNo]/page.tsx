import type { Metadata } from "next";
import { WatchView } from "@/components/watch-view";
import { titleFromSlug } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slugId: string; source: string; streamNo: string }>;
}): Promise<Metadata> {
  const { slugId } = await params;
  const title = titleFromSlug(slugId);
  return {
    title: `Watch ${title} Stream Links`,
    description: `Watch ${title} online for free on EpicStream.`,
  };
}

export default async function WatchStreamPage({
  params,
}: {
  params: Promise<{ slugId: string; source: string; streamNo: string }>;
}) {
  const { slugId, source, streamNo } = await params;
  return <WatchView key={slugId} slugId={slugId} source={source} streamNo={streamNo} />;
}