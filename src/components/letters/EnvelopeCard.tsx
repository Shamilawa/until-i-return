"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { PEOPLE } from "@/lib/config";
import { formatInZone, shortDuration } from "@/lib/time";
import { useNow } from "@/lib/use-now";
import { Envelope } from "./Envelope";

type Props = {
  id: string;
  unlockAt: string;
  isUnlocked: boolean;
  weekNumber: number;
  /** Null while the letter is locked: the server never sends it. */
  title: string | null;
  isRead: boolean;
};

export function EnvelopeCard({ id, unlockAt, isUnlocked, weekNumber, title, isRead }: Props) {
  const weekLabel = `A letter for week ${weekNumber}`;

  if (!isUnlocked) return <LockedEnvelope unlockAt={unlockAt} label={weekLabel} />;

  return (
    <Link
      href={`/letters/${id}`}
      className={`card flex min-h-44 flex-col items-center gap-1 p-4 text-center transition-transform active:scale-95 ${
        isRead ? "" : "shadow-glow"
      }`}
    >
      <Envelope state={isRead ? "read" : "unread"} className="w-24" />
      <p className="line-clamp-2 font-display text-base font-semibold text-ink">{title ?? weekLabel}</p>
      {isRead ? (
        <p className="text-xs text-ink-soft">{formatInZone(new Date(unlockAt), PEOPLE.reader.timeZone, "d MMM yyyy")}</p>
      ) : (
        <p className="rounded-full bg-gold/25 px-3 py-0.5 text-xs font-bold text-ink">New! Tap to open</p>
      )}
    </Link>
  );
}

function LockedEnvelope({ unlockAt, label }: { unlockAt: string; label: string }) {
  const router = useRouter();
  const now = useNow();
  const target = new Date(unlockAt);
  const remaining = now === null ? null : target.getTime() - now;

  // The countdown is decoration; when it ends the server is asked again.
  const refreshed = useRef(false);
  useEffect(() => {
    if (remaining !== null && remaining <= 0 && !refreshed.current) {
      refreshed.current = true;
      router.refresh();
    }
  }, [remaining, router]);

  return (
    <div className="card flex min-h-44 flex-col items-center gap-1 p-4 text-center" aria-label={`${label}, still sealed`}>
      <Envelope state="locked" className="w-24" />
      <p className="font-display text-base font-medium text-ink-soft">{label}</p>
      <p className="rounded-full bg-lavender/50 px-3 py-0.5 text-xs font-bold tabular-nums text-ink" role="timer">
        🔒 {remaining === null ? "…" : remaining <= 0 ? "Opening…" : shortDuration(remaining)}
      </p>
      <p className="text-xs text-ink-soft">{formatInZone(target, PEOPLE.reader.timeZone, "EEE d MMM, h:mm a")}</p>
    </div>
  );
}
