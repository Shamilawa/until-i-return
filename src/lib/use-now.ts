"use client";

import { useSyncExternalStore } from "react";

function subscribe(onTick: () => void): () => void {
  const id = setInterval(onTick, 1000);
  return () => clearInterval(id);
}

const getSnapshot = (): number | null => Math.floor(Date.now() / 1000) * 1000;
const getServerSnapshot = (): number | null => null;

/** Current time in ms, ticking every second. Null during server render and hydration. */
export function useNow(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
