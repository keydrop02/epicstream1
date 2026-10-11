"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { SearchDialog } from "@/components/search-dialog";
import { FeedbackDialog } from "@/components/feedback-dialog";
import { Button } from "@/components/ui/button";
import { categoryName } from "@/lib/format";
import type { Sport } from "@/lib/types";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/schedule", label: "Schedule" },
  { href: "/multiview", label: "Multi Stream" },
];

function SportsMenu({ sports }: { sports: Sport[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (sports.length === 0) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1 text-foreground/60 transition-colors hover:text-foreground/80"
      >
        Sports
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-50 mt-2 max-h-[70vh] w-56 overflow-y-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg"
        >
          {sports.map((s) => (
            <Link
              key={s.id}
              href={`/schedule?sport=${s.id}`}
              onClick={() => setOpen(false)}
              className="block truncate rounded-sm px-2 py-1.5 transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {categoryName(s.id)}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function SiteHeader({ sports }: { sports: Sport[] }) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sportsOpen, setSportsOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const closeFeedback = useCallback(() => setFeedbackOpen(false), []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setSportsOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [menuOpen]);

  const openSearch = useCallback(() => {
    setMenuOpen(false);
    setSearchOpen(true);
  }, []);

  const openFeedback = useCallback(() => {
    setMenuOpen(false);
    setFeedbackOpen(true);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background md:bg-background/95 md:backdrop-blur supports-[backdrop-filter]:md:bg-background/80">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between gap-2 px-4 sm:px-6 md:gap-4 lg:px-10">
          <Link href="/" className="flex shrink-0 items-center font-bold md:hidden">
            <span className="text-2xl">EpicStream</span>
          </Link>

          <div className="mr-4 hidden items-center md:flex">
            <Link href="/" className="relative mr-6 flex items-center">
              <span className="hidden text-xl font-bold sm:inline-block">EpicStream</span>
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              {navItems.slice(0, 2).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "transition-colors hover:text-foreground/80",
                    pathname === item.href ? "text-foreground" : "text-foreground/60",
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <SportsMenu sports={sports} />
              <button
                type="button"
                onClick={openFeedback}
                className="text-foreground/60 transition-colors hover:text-foreground/80"
              >
                Feedback
              </button>
            </nav>
          </div>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex h-10 min-w-0 max-w-md flex-1 items-center gap-2 rounded-sm border border-border bg-background px-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 md:hidden"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="truncate">Search…</span>
          </button>

          <div className="flex shrink-0 items-center justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setSearchOpen(true)}
              className="relative hidden h-11 w-80 justify-start text-base font-normal text-muted-foreground md:flex lg:w-96"
            >
              <Search className="h-4 w-4" />
              Search
            </Button>

            <Link href="/multiview" className="hidden md:block">
              <Button variant="outline">Multi Stream</Button>
            </Link>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setMenuOpen(true)}
              aria-label="Menu"
              className="md:hidden"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-[60] md:hidden",
          menuOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!menuOpen}
      >
        <div
          onClick={closeMenu}
          className={cn(
            "absolute inset-0 bg-black/55 transition-opacity duration-200",
            menuOpen ? "opacity-100" : "opacity-0",
          )}
        />
        <aside
          aria-label="Mobile menu"
          className={cn(
            "absolute right-0 top-0 flex h-full w-[80%] max-w-[min(20rem,85vw)] flex-col bg-black shadow-[-4px_0_24px_rgba(0,0,0,0.45)] transition-transform duration-200 ease-out",
            menuOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex shrink-0 items-start justify-end gap-3 px-5 pb-4 pt-[max(12px,env(safe-area-inset-top))]">
            <button
              type="button"
              onClick={closeMenu}
              aria-label="Close menu"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-[#222222] text-white transition-colors hover:bg-white/[0.04]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
            <nav className="flex flex-col" aria-label="Mobile">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={cn(
                    "py-4 text-lg font-bold tracking-tight",
                    pathname === item.href ? "text-white" : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </Link>
              ))}

              {sports.length > 0 && (
                <div>
                  <button
                    type="button"
                    onClick={() => setSportsOpen((v) => !v)}
                    aria-expanded={sportsOpen}
                    aria-label="Sports menu"
                    className="flex w-full items-center justify-between py-4 text-left text-lg font-bold tracking-tight text-muted-foreground"
                  >
                    Sports
                    <span
                      className={cn("shrink-0 text-xs transition-transform", sportsOpen && "rotate-180")}
                      aria-hidden
                    >
                      ▾
                    </span>
                  </button>
                  {sportsOpen && (
                    <div className="border-t border-border pl-1 pt-1">
                      {sports.map((s) => (
                        <Link
                          key={s.id}
                          href={`/schedule?sport=${s.id}`}
                          onClick={closeMenu}
                          className="block py-3 text-base font-semibold text-muted-foreground transition-colors hover:text-white"
                        >
                          {categoryName(s.id)}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={openFeedback}
                className="flex items-center gap-2 py-4 text-left text-lg font-bold tracking-tight text-muted-foreground"
              >
                Feedback
              </button>
            </nav>
          </div>
        </aside>
      </div>

      {searchOpen && <SearchDialog onClose={closeSearch} />}
      {feedbackOpen && <FeedbackDialog onClose={closeFeedback} />}
    </>
  );
}