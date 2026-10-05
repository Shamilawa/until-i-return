"use client";

import { AnimatePresence, motion } from "motion/react";
import { PEOPLE } from "@/lib/config";
import { separationProgress, splitDuration } from "@/lib/time";
import { useNow } from "@/lib/use-now";
import { FlightPath } from "./FlightPath";

type Props = { leaveAt: string; reunionAt: string };

export function Countdown({ leaveAt, reunionAt }: Props) {
  const now = useNow();
  const leave = new Date(leaveAt);
  const reunion = new Date(reunionAt);

  const remaining = now === null ? null : reunion.getTime() - now;
  const parts = remaining === null ? null : splitDuration(remaining);
  const progress = now === null ? null : separationProgress(leave, reunion, new Date(now));
  const home = remaining !== null && remaining <= 0;
  const notLeftYet = now !== null && now < leave.getTime();

  return (
    <section className="card text-center">
      <p className="font-display text-sm font-medium uppercase tracking-widest text-ink-soft">
        {home ? "The wait is over" : "Until I'm home"}
      </p>

      {home ? (
        <p className="my-6 font-display text-4xl font-semibold text-rose-deep">I&apos;m home 💛</p>
      ) : (
        <div className="my-4 grid grid-cols-4 gap-2" role="timer" aria-label="Time until we are together again">
          <Unit value={parts?.days} label="days" />
          <Unit value={parts?.hours} label="hours" />
          <Unit value={parts?.minutes} label="mins" />
          <Unit value={parts?.seconds} label="secs" />
        </div>
      )}

      <FlightPath fraction={progress?.fraction ?? 0} />

      <div className="mt-3">
        <div className="h-2.5 overflow-hidden rounded-full bg-white/70" aria-hidden>
          <div
            className="h-full rounded-full bg-linear-to-r from-rose to-gold transition-[width] duration-700"
            style={{ width: `${(progress?.fraction ?? 0) * 100}%` }}
          />
        </div>
        <p className="mt-2 font-display text-sm text-ink">
          {progress === null
            ? " "
            : notLeftYet
              ? `The journey begins soon, ${PEOPLE.reader.nickname} ✈️`
              : `${progress.daysDown} days down, ${progress.daysToGo} to go · ${(progress.fraction * 100).toFixed(1)}%`}
        </p>
      </div>
    </section>
  );
}

function Unit({ value, label }: { value: number | undefined; label: string }) {
  const text = value === undefined ? "--" : String(value).padStart(2, "0");
  return (
    <div className="rounded-2xl bg-white/75 px-1 py-3 shadow-soft">
      <div className="relative h-10 overflow-hidden font-display text-4xl font-semibold tabular-nums text-ink">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={text}
            className="absolute inset-0"
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 26 }}
          >
            {text}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</div>
    </div>
  );
}
