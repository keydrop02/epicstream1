import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 border-t border-border">
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col items-center px-3 py-12 text-center sm:px-4 lg:px-6">
        <Link href="/" className="inline-block">
          <span className="font-display text-2xl font-bold tracking-tight text-white">{SITE_NAME}</span>
        </Link>

        <h2 className="mt-6 text-lg font-semibold tracking-tight text-foreground">
          How to Watch Live Sports Free Online
        </h2>

        <p className="mt-4 max-w-5xl text-sm leading-relaxed text-muted-foreground">
          EpicStream is your gateway to stream top-tier sports entertainment from around the globe.
          Wondering how to watch IPL live or how to watch NBA games without cable? Looking for how
          to watch World Cup 2026 live streaming? We cover it all. Get access to Premier League live
          streams, Champions League fixtures, NFL game day coverage, UFC pay-per-view events, and F1
          racing action for free online. Find the best sites to stream live sports in HD with
          real-time match schedules, upcoming fixtures, and premium-quality streams from top sports
          leagues worldwide. Bookmark EpicStream for free live sports streaming and never miss a
          match.
        </p>

        <p className="mt-8 w-full max-w-5xl border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground/80">
          <span className="font-semibold text-muted-foreground">Disclaimer:</span> {SITE_NAME} does
          not host, store, or broadcast any media content. All streams displayed are embedded from
          publicly available third-party sources. We do not claim ownership of any content and
          comply with all applicable copyright laws. Content owners may request removal by
          contacting us directly.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-muted-foreground/80">
          <span>
            © {year} {SITE_NAME}
          </span>
          <span>·</span>
          <span>All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
