"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Carousel({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    el.addEventListener("scroll", update, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", update);
    };
  }, [update]);

  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div className="absolute right-0 top-0 z-10 flex -translate-y-full items-center gap-1 pb-2">
        <button
          type="button"
          aria-label="Previous"
          onClick={() => scrollBy(-1)}
          disabled={!canPrev}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background transition-opacity",
            canPrev ? "opacity-100" : "pointer-events-none opacity-40",
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Next"
          onClick={() => scrollBy(1)}
          disabled={!canNext}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background transition-opacity",
            canNext ? "opacity-100" : "pointer-events-none opacity-40",
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div
        ref={ref}
        className={cn(
          "no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
