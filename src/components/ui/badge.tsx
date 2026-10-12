import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Variant = "secondary" | "outline" | "live";

const variants: Record<Variant, string> = {
  secondary: "bg-secondary text-secondary-foreground border-transparent",
  outline: "text-foreground border-border",
  live: "bg-primary text-primary-foreground border-transparent",
};

export function Badge({
  variant = "secondary",
  className,
  children,
}: {
  variant?: Variant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
