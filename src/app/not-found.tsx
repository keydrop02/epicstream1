import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container mx-auto flex flex-1 max-w-screen-md flex-col items-center justify-center gap-4 px-4 text-center sm:px-6 lg:px-10">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">
        This page could not be found. The match may have ended or the URL is incorrect.
      </p>
      <div className="flex gap-3">
        <ButtonLink href="/">Go home</ButtonLink>
        <Link
          href="/schedule"
          className="inline-flex h-10 items-center rounded-md border border-input px-4 text-sm font-medium hover:bg-accent"
        >
          View schedule
        </Link>
      </div>
    </div>
  );
}
