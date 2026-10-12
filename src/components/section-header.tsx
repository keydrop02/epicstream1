import Link from "next/link";
import type { ReactNode } from "react";

export function SectionHeader({
  title,
  icon,
  href,
  action,
  badge,
  as: Heading = "h2",
}: {
  title: string;
  icon?: ReactNode;
  href?: string;
  action?: ReactNode;
  badge?: ReactNode;
  as?: "h2" | "h3";
}) {
  const heading = (
    <Heading className="flex items-center gap-2 text-xl font-bold tracking-tight sm:text-2xl">
      {icon}
      {title}
      {badge}
    </Heading>
  );
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      {href ? (
        <Link href={href} className="transition-opacity hover:opacity-80">
          {heading}
        </Link>
      ) : (
        heading
      )}
      {action}
    </div>
  );
}
