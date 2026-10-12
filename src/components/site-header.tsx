"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  LayoutGrid,
  Menu,
  MessageSquare,
  Search,
  X,
} from "lucide-react";
import { SearchDialog } from "@/components/search-dialog";
import { FeedbackDialog } from "@/components/feedback-dialog";
import { Button } from "@/components/ui/button";
import { categoryName } from "@/lib/format";
import type { Sport } from "@/lib/types";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/schedule", label: "Schedule" },
];

function refreshNavigate(e: ReactMouseEvent<HTMLAnchorElement>, href: string) {
  e.preventDefault();
  window.location.assign(href);
}

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
        className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        Sports
        <ChevronDown
          className={cn("h-4 w-4 transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-50 mt-3 max-h-[70vh] w-56 overflow-y-auto rounded-xl border border-border bg-popover p-1.5 shadow-2xl shadow-black/50"
        >
          {sports.map((s) => (
            <Link
              key={s.id}
              href={`/schedule?sport=${s.id}`}
              onClick={(e) => refreshNavigate(e, `/schedule?sport=${s.id}`)}
              className="block truncate rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
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
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

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
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-screen-2xl items-center gap-4 px-3 sm:gap-6 sm:px-4 lg:px-6">
          <Link href="/" onClick={(e) => refreshNavigate(e, "/")} className="group flex shrink-0 items-center">
            <span className="font-display text-2xl font-bold tracking-tight text-white">
              EpicStream
            </span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => refreshNavigate(e, item.href)}
                className={cn(
                  "text-sm transition-colors hover:text-foreground",
                  pathname === item.href ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
            <SportsMenu sports={sports} />
            <button
              type="button"
              onClick={openFeedback}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Feedback
            </button>
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={openSearch}
              aria-label="Search"
              className="flex h-10 w-10 items-center justify-center gap-2 rounded-lg border border-border bg-secondary/40 text-sm text-muted-foreground transition-colors hover:border-white/15 hover:text-foreground md:w-auto md:min-w-72 md:justify-start md:px-3.5"
            >
              <Search className="h-4 w-4 shrink-0" />
              <span className="hidden md:inline">Search</span>
            </button>

            <Link href="/multiview" onClick={(e) => refreshNavigate(e, "/multiview")} className="hidden md:block">
              <Button variant="outline" className="gap-2">
                <LayoutGrid className="h-4 w-4" />
                Multi Stream
              </Button>
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
        inert={!menuOpen}
      >
        <div
          onClick={closeMenu}
          className={cn(
            "absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-200",
            menuOpen ? "opacity-100" : "opacity-0",
          )}
        />
        <aside
          aria-label="Mobile menu"
          className={cn(
            "absolute right-0 top-0 flex h-full w-[82%] max-w-[min(20rem,85vw)] flex-col border-l border-border bg-popover shadow-2xl shadow-black/60 transition-transform duration-200 ease-out",
            menuOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-border px-5 pb-4 pt-[max(14px,env(safe-area-inset-top))]">
            <span className="text-sm font-semibold text-muted-foreground">Menu</span>
            <Button variant="ghost" size="icon" onClick={closeMenu} aria-label="Close menu">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
            <nav className="mt-2 flex flex-col" aria-label="Mobile">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => refreshNavigate(e, item.href)}
                  className={cn(
                    "border-b border-border py-4 text-base font-medium",
                    pathname === item.href ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </Link>
              ))}

              {sports.length > 0 && (
                <div className="border-b border-border">
                  <button
                    type="button"
                    onClick={() => setSportsOpen((v) => !v)}
                    aria-expanded={sportsOpen}
                    className="flex w-full items-center justify-between py-4 text-left text-base font-medium text-muted-foreground"
                  >
                    Sports
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        sportsOpen && "rotate-180",
                      )}
                    />
                  </button>
                  {sportsOpen && (
                    <div className="pb-2 pl-1">
                      {sports.map((s) => (
                        <Link
                          key={s.id}
                          href={`/schedule?sport=${s.id}`}
                          onClick={(e) => refreshNavigate(e, `/schedule?sport=${s.id}`)}
                          className="block py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
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
                className="flex items-center gap-2 border-b border-border py-4 text-left text-base font-medium text-muted-foreground"
              >
                <MessageSquare className="h-4 w-4" />
                Feedback
              </button>
            </nav>

            <Link href="/multiview" onClick={(e) => refreshNavigate(e, "/multiview")} className="mt-5 block">
              <Button className="w-full gap-2">
                <LayoutGrid className="h-4 w-4" />
                Multi Stream
              </Button>
            </Link>
          </div>
        </aside>
      </div>

      {searchOpen && <SearchDialog onClose={closeSearch} />}
      {feedbackOpen && <FeedbackDialog onClose={closeFeedback} />}
    </>
  );
}
