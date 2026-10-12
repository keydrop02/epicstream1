import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-5 px-3 py-24 text-center sm:px-4 lg:px-6">
      <span className="text-7xl font-bold tracking-tight text-primary">404</span>
      <p className="max-w-md text-sm text-muted-foreground">
        This page could not be found. The match may have ended or the URL is incorrect.
      </p>
      <div className="mt-2 flex gap-3">
        <ButtonLink href="/">Go home</ButtonLink>
        <ButtonLink href="/schedule" variant="outline">
          View schedule
        </ButtonLink>
      </div>
    </div>
  );
}
