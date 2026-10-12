import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} - Watch Live Sports Online`,
    short_name: SITE_NAME,
    description: `${SITE_NAME} is the best source to watch live sport online for free, watch on any device!`,
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#09090b",
    theme_color: "#09090b",
    categories: ["sports", "entertainment"],
    icons: [
      { src: "/favicon.png", sizes: "1254x1254", type: "image/png", purpose: "any" },
      { src: "/favicon.png", sizes: "any", type: "image/png", purpose: "any" },
    ],
  };
}
