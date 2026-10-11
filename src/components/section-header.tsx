import Link from "next/link";
import type { ReactNode } from "react";

export function SectionHeader({
  title,
  icon,
  href,
  action,
}: {
  title: string;
  icon?: ReactNode;
  href?: string;
  action?: ReactNode;
}) {
  const heading = (
    <span className="flex items-center gap-2 text-xl font-bold">
      {icon}
      {title}
    </span>
  );
  return (
    <div className="mb-2 flex items-center justify-between gap-4">
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
