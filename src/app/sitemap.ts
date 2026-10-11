import type { MetadataRoute } from "next";
import { getAllMatches } from "@/lib/api";
import { matchSlug } from "@/lib/format";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "always", priority: 1 },
    { url: `${SITE_URL}/schedule`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/multiview`, changeFrequency: "always", priority: 0.7 },
  ];

  const matches = await getAllMatches().catch(() => []);
  urls.push(
    ...matches.map((m) => ({
      url: `${SITE_URL}/watch/${matchSlug(m)}`,
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
  );

  return urls;
}