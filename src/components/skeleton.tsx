import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-secondary/70", className)} />;
}

export function TextSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn("h-4 w-full", className)} />;
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-card", className)}>
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="space-y-2 p-3 md:absolute md:inset-x-0 md:bottom-0 md:bg-gradient-to-t md:from-black/90 md:to-transparent md:pt-12 md:pb-3">
        <TextSkeleton className="h-4 w-3/4 md:bg-white/30 md:h-4" />
        <TextSkeleton className="h-3.5 w-1/2 md:hidden" />
      </div>
    </div>
  );
}

export function RailSkeleton({ count = 4 }: { count?: number }) {
  const slideClass =
    "min-w-0 shrink-0 basis-[calc(50%-0.5rem)] md:basis-[calc(42%-0.5rem)] lg:basis-[calc(31%-0.5rem)] xl:basis-[calc(23.5%-0.5rem)]";
  return (
    <div className="flex gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={slideClass}>
          <CardSkeleton />
        </div>
      ))}
    </div>
  );
}

export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
      <Skeleton className="h-11 w-[4.5rem]" />
      <div className="flex-1 space-y-2">
        <TextSkeleton className="h-4 w-3/4" />
        <TextSkeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}
