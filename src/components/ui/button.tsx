import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "outline" | "secondary" | "ghost" | "destructive";
type Size = "default" | "sm" | "lg" | "icon";

const variantClasses: Record<Variant, string> = {
  default:
    "bg-primary text-primary-foreground shadow-[0_6px_24px_-8px_rgba(239,68,68,0.7)] hover:bg-primary/90",
  outline: "border border-border bg-transparent hover:bg-accent hover:text-accent-foreground",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/70",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
};

const sizeClasses: Record<Size, string> = {
  default: "h-10 rounded-lg px-5",
  sm: "h-9 rounded-md px-3",
  lg: "h-11 rounded-lg px-8",
  icon: "h-10 w-10 rounded-lg",
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children?: ReactNode;
}

export function buttonClass({ variant = "default", size = "default", className }: BaseProps = {}) {
  return cn(
    "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

export function Button({
  variant,
  size,
  className,
  children,
  ...props
}: BaseProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={buttonClass({ variant, size, className })} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant,
  size,
  className,
  children,
  target,
  rel,
}: BaseProps & { href: string; target?: string; rel?: string }) {
  const cls = buttonClass({ variant, size, className });
  if (href.startsWith("http")) {
    return (
      <a href={href} className={cls} target={target} rel={rel}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} target={target} rel={rel}>
      {children}
    </Link>
  );
}
