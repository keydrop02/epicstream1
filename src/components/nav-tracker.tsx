"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { registerPathChange } from "@/lib/nav-history";

export function NavTracker() {
  const pathname = usePathname();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    registerPathChange();
  }, [pathname]);

  return null;
}
