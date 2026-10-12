"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Copy, LoaderCircle, X } from "lucide-react";
import { CountdownTimer } from "@/components/countdown-timer";
import { SourceList } from "@/components/source-list";
import type { StreamGroup } from "@/components/source-list";
import { Button } from "@/components/ui/button";
import { safeEmbedUrl } from "@/lib/format";
import type { Stream } from "@/lib/types";

function PlayerFrame({ src, title }: { src: string; title: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
          <div className="text-center">
            <LoaderCircle className="mx-auto h-10 w-10 animate-spin text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">Loading player…</p>
          </div>
        </div>
      )}
      <iframe
        src={src}
        title={`${title} Player`}
        allowFullScreen
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        onLoad={() => setLoaded(true)}
        className="h-full w-full"
      />
    </>
  );
}

function EmbedCodeDialog({ src, onClose }: { src: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const escapedSrc = src.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  const code = `<iframe src="${escapedSrc}" width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-pointer bg-black/70 backdrop-blur-sm"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="embed-code-title"
        className="relative z-10 flex w-[min(640px,calc(100%-32px))] flex-col overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl shadow-black/60 outline-none"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 id="embed-code-title" className="flex items-center gap-2 text-base font-semibold">
            <Copy className="h-4 w-4 text-primary" />
            Embed Code
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-3 p-5">
          <pre className="max-h-[50vh] overflow-x-auto rounded-lg border border-border bg-background p-3.5 text-xs leading-relaxed text-muted-foreground">
            {code}
          </pre>
          <Button type="button" onClick={copy} className="w-full">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy code"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function StreamsPanel({
  title,
  groups,
  slug,
  startsAt,
  initialStream = null,
}: {
  title: string;
  groups: StreamGroup[];
  slug: string;
  startsAt?: number;
  initialStream?: Stream | null;
}) {
  const [activeStream, setActiveStream] = useState<Stream | null>(initialStream);
  const [embedOpen, setEmbedOpen] = useState(false);
  const router = useRouter();

  const embedUrl = activeStream ? safeEmbedUrl(activeStream.embedUrl) : null;

  const closeEmbed = useCallback(() => setEmbedOpen(false), []);

  const selectStream = (s: Stream) => {
    const url = `/watch/${slug}/${s.source}/${s.streamNo}`;
    if (activeStream) {
      router.replace(url);
    } else {
      router.push(url);
    }
    setActiveStream(s);
  };

  const goBack = () => {
    if (activeStream && typeof window !== "undefined" && window.history.length <= 1) {
      router.replace(`/watch/${slug}`);
      return;
    }
    router.back();
  };

  return (
    <div className="h-full w-full px-3 pt-2">
      <div className="relative flex h-full w-full justify-center overflow-x-hidden">
        <div className="mx-auto h-full w-full max-w-4xl overflow-y-clip">
          <div className="py-3 text-center">
            <h1 className="text-xl font-bold tracking-tight md:text-2xl">{title}</h1>
            {activeStream ? null : (
              <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
                To watch {title}, scroll down and select your preferred stream. If no links are
                available, wait for the countdown to finish until the event goes live.
              </p>
            )}
            {startsAt ? (
              <div className="flex w-full justify-center">
                <CountdownTimer
                  to={startsAt}
                  className="mt-2 flex w-fit flex-col items-center gap-1 pt-3 text-base font-bold tabular-nums tracking-wide text-primary sm:flex-row sm:items-baseline sm:gap-2 sm:text-lg"
                />
              </div>
            ) : null}
          </div>

          <div className="w-full">
            <div className="w-full">
              {activeStream ? (
                <div className="relative mb-3 w-full">
                  {embedUrl ? (
                    <>
                      <div className="relative mx-auto aspect-video w-full overflow-hidden rounded-xl border border-border bg-secondary/40">
                        <PlayerFrame key={embedUrl} src={embedUrl} title={title} />
                      </div>

                      <div className="mt-3 flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEmbedOpen(true)}
                          className="w-full sm:w-auto"
                        >
                          <Copy className="h-4 w-4" />
                          <span>Embed Code</span>
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-xl border border-border bg-secondary/40 p-6 text-center text-sm text-muted-foreground">
                      This stream could not be loaded because its source is unavailable.
                    </div>
                  )}
                </div>
              ) : null}

              <div id="available-streams" className="mt-4">
                <div className="mb-4 flex items-center">
                  <h2 className="text-base font-semibold">Available Streams</h2>
                  <Button variant="ghost" size="sm" onClick={goBack} className="ml-auto">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                </div>

                {groups.length === 0 ? (
                  <div className="rounded-xl border border-border bg-secondary/40 p-6 text-center text-sm text-muted-foreground">
                    No stream links are available yet. If there are no links or buttons, please wait
                    for the timer to countdown until the event is live.
                  </div>
                ) : (
                  <SourceList
                    groups={groups}
                    heading={null}
                    activeStream={activeStream}
                    onSelect={selectStream}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {embedOpen && embedUrl ? <EmbedCodeDialog src={embedUrl} onClose={closeEmbed} /> : null}
    </div>
  );
}
