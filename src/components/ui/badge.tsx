import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Variant = "primary" | "orange" | "secondary" | "outline" | "live";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground border-transparent",
  orange: "bg-orange-600 text-white border-transparent",
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
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold transition-colors",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
