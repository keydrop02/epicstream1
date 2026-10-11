"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

export function useIsClient(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

let mountedAt: number | null = null;

function getMountedAt(): number {
  if (mountedAt === null) mountedAt = Date.now();
  return mountedAt;
}

export function useMountTime(): number | null {
  return useSyncExternalStore(emptySubscribe, getMountedAt, () => null);
}
