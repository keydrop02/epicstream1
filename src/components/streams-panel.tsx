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
            <LoaderCircle className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Loading player...</p>
          </div>
        </div>
      )}
      <iframe
        src={src}
        title={`${title} Player`}
        allowFullScreen
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        onLoad={() => setLoaded(true)}
        className="h-full w-full rounded-lg"
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
        className="absolute inset-0 cursor-pointer bg-black/60 backdrop-blur-sm"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="embed-code-title"
        className="relative z-10 flex w-[min(640px,calc(100%-32px))] flex-col overflow-hidden rounded-lg border border-border bg-background text-foreground shadow-lg outline-none"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 id="embed-code-title" className="flex items-center gap-2 text-lg font-semibold">
            <Copy className="h-4 w-4" />
            Embed Code
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3 p-4">
          <pre className="max-h-[50vh] overflow-x-auto rounded-md bg-secondary p-3 text-xs leading-relaxed">
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
          <div className="py-2 text-center">
            <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
            {activeStream ? null : (
              <p className="text-sm text-muted-foreground">
                To watch {title}, scroll down and select your preferred stream. If no links are
                available, wait for the countdown to finish until the event goes live.
              </p>
            )}
            {startsAt ? (
              <div className="flex w-full justify-center">
                <CountdownTimer
                  to={startsAt}
                  className="mt-2 flex w-fit flex-col items-center gap-1 pt-3 text-lg font-bold tabular-nums tracking-wide text-primary sm:flex-row sm:items-baseline sm:gap-2 sm:text-xl"
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
                      <div className="relative mx-auto aspect-video w-full overflow-hidden rounded-lg border border-border bg-background/20">
                        <PlayerFrame key={embedUrl} src={embedUrl} title={title} />
                      </div>

                      <div className="mt-2 flex justify-end gap-2">
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
                    <div className="rounded-lg border border-border bg-secondary/40 p-6 text-center text-sm text-muted-foreground">
                      This stream could not be loaded because its source is unavailable.
                    </div>
                  )}
                </div>
              ) : null}

              <div id="available-streams" className="mt-3">
                <div className="mb-3 flex items-center">
                  <h2 className="text-base font-semibold">Available Streams</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goBack}
                    className="ml-auto"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                </div>

                {groups.length === 0 ? (
                  <div className="rounded-lg border border-border bg-secondary/40 p-6 text-center text-sm text-muted-foreground">
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
