"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { PEOPLE } from "@/lib/config";
import { formatInZone, shortDuration } from "@/lib/time";
import { useNow } from "@/lib/use-now";

type Props = {
  /** When the next letter opens. */
  unlockAt: string;
  /** False when nothing is written for that slot yet. */
  letterWaiting: boolean;
};

export function NextLetterTimer({ unlockAt, letterWaiting }: Props) {
  const router = useRouter();
  const now = useNow();
  const target = new Date(unlockAt);
  const remaining = now === null ? null : target.getTime() - now;

  // The moment it opens, ask the server again: it decides what is unlocked.
  const refreshed = useRef(false);
  useEffect(() => {
    if (remaining !== null && remaining <= 0 && !refreshed.current) {
      refreshed.current = true;
      router.refresh();
    }
  }, [remaining, router]);

  return (
    <Link href="/letters" className="card flex min-h-16 items-center gap-4 p-4 transition-transform active:scale-[0.98]">
      <svg viewBox="0 0 48 36" width="48" height="36" aria-hidden className="shrink-0 animate-float">
        <rect x="1" y="1" width="46" height="34" rx="6" fill="#fffaf0" stroke="#e2cca8" strokeWidth="1.5" />
        <path d="M2 4l22 16L46 4" fill="none" stroke="#e2cca8" strokeWidth="1.5" />
        <circle cx="24" cy="20" r="6" fill="#d6455f" />
      </svg>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
          {letterWaiting ? "Next letter opens in" : "Next letter day in"}
        </p>
        <p className="font-display text-xl font-semibold tabular-nums text-ink" role="timer">
          {remaining === null ? "…" : remaining <= 0 ? "It's here!" : shortDuration(remaining)}
        </p>
        <p className="text-xs text-ink-soft">
          {formatInZone(target, PEOPLE.reader.timeZone, "EEEE d MMM, h:mm a")} in {PEOPLE.reader.city}
        </p>
      </div>
      <span aria-hidden className="text-xl text-ink-soft">
        ›
      </span>
    </Link>
  );
}
