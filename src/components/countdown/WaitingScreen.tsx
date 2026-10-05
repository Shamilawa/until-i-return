"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { PEOPLE, WAITING_MESSAGE } from "@/lib/config";
import { Envelope } from "@/components/letters/Envelope";
import { logout } from "@/server/actions";

const CHECK_EVERY_MS = 20_000;
const HINT_EVERY_MS = 6000;
const SCRAMBLE_EVERY_MS = 140;

type Props = {
  /** How many letters are already sealed inside. Only the number is known here. */
  sealedCount: number;
};

/**
 * All she sees before take-off: a sealed, teasing preview. It also asks the
 * server now and then, so it opens by itself once the journey starts.
 */
export function WaitingScreen({ sealedCount }: Props) {
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, CHECK_EVERY_MS);
    return () => clearInterval(id);
  }, [router]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-[80dvh] flex-col items-center justify-center gap-5 text-center">
        <motion.div
          className="relative"
          animate={{ rotate: [0, -3, 3, -2, 0], y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Envelope state="unread" className="w-36" />
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-seal px-3 py-0.5 font-display text-xs font-medium text-white shadow-soft">
            🔒 {WAITING_MESSAGE.sealedTag}
          </span>
        </motion.div>

        <div className="card flex flex-col gap-4">
          <h1 className="font-display text-2xl font-semibold text-ink">
            {WAITING_MESSAGE.title}, {PEOPLE.reader.nickname} <span aria-hidden>✨</span>
          </h1>
          <p className="text-lg leading-7 text-ink">{WAITING_MESSAGE.intro}</p>

          <LockedCountdown />

          <div className="rounded-2xl bg-gold/20 p-4">
            <p className="font-display text-lg font-semibold text-ink">
              <span aria-hidden>✈️ </span>
              {WAITING_MESSAGE.instruction}
            </p>
            {/* The home-screen app has no browser reload button, so offer one here. */}
            <button
              type="button"
              className="btn btn-primary mt-3"
              disabled={refreshing}
              onClick={() => startRefresh(() => router.refresh())}
            >
              {refreshing ? "Checking…" : "Refresh"}
            </button>
          </div>

          <div className="text-left">
            <h2 className="mb-2 text-center font-display text-sm font-medium uppercase tracking-widest text-ink-soft">
              {WAITING_MESSAGE.insideTitle}
            </h2>
            <ul className="flex flex-col gap-2">
              {WAITING_MESSAGE.inside.map((item, i) => (
                <motion.li
                  key={item.text}
                  className="flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-2.5 text-ink"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.25, type: "spring", stiffness: 160, damping: 18 }}
                >
                  <span aria-hidden className="text-xl">
                    {item.emoji}
                  </span>
                  <span className="flex-1">{item.text}</span>
                  <span aria-hidden className="text-sm opacity-60">
                    🔒
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>

          {sealedCount > 0 && <SealedStack count={sealedCount} />}

          <Hint />

          <p className="font-display text-ink-soft">
            {PEOPLE.author.name} <span aria-hidden>💛</span>
          </p>
        </div>

        <form action={logout}>
          <button type="submit" className="min-h-11 rounded-full px-3 text-sm font-semibold text-ink-soft underline-offset-4 hover:underline">
            Sign out
          </button>
        </form>
      </div>
    </MotionConfig>
  );
}

/** A frosted preview of the countdown: the shape is visible, the numbers refuse to hold still. */
function LockedCountdown() {
  const [digits, setDigits] = useState<string[] | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const scramble = () => Array.from({ length: 4 }, () => String(Math.floor(Math.random() * 100)).padStart(2, "0"));
    const id = setInterval(() => setDigits(scramble()), SCRAMBLE_EVERY_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative" aria-label="A countdown, locked until take-off" role="img">
      <div className="grid grid-cols-4 gap-2 blur-[5px]" aria-hidden>
        {["days", "hours", "mins", "secs"].map((label, i) => (
          <div key={label} className="rounded-2xl bg-white/75 px-1 py-3 shadow-soft">
            <div className="font-display text-3xl font-semibold tabular-nums text-ink">{digits?.[i] ?? "??"}</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</div>
          </div>
        ))}
      </div>
      <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
        <span className="rounded-full bg-ink/85 px-4 py-1.5 font-display text-sm font-medium text-white shadow-soft">
          🔒 Counting down to… something
        </span>
      </div>
    </div>
  );
}

const MAX_STACK = 7;

/** A fanned row of sealed envelopes with the real number waiting inside. */
function SealedStack({ count }: { count: number }) {
  const shown = Math.min(count, MAX_STACK);
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl bg-lavender/35 p-4">
      <div className="flex justify-center pl-5" aria-hidden>
        {Array.from({ length: shown }, (_, i) => (
          <motion.div
            key={i}
            className="-ml-5"
            initial={{ opacity: 0, y: 14, rotate: 0 }}
            animate={{ opacity: 1, y: 0, rotate: (i - (shown - 1) / 2) * 5 }}
            transition={{ delay: 0.8 + i * 0.1, type: "spring", stiffness: 200, damping: 16 }}
          >
            <Envelope state="locked" className="w-14 drop-shadow" />
          </motion.div>
        ))}
      </div>
      <p className="font-display text-ink">
        <span className="text-2xl font-semibold text-rose-deep">{count}</span> {count === 1 ? "envelope is" : "envelopes are"} already
        sealed with your name on {count === 1 ? "it" : "them"}.
      </p>
    </div>
  );
}

function Hint() {
  const hints = WAITING_MESSAGE.hints;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % hints.length), HINT_EVERY_MS);
    return () => clearInterval(id);
  }, [hints.length]);

  return (
    <div className="flex min-h-14 items-center justify-center" aria-live="off">
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          className="text-sm italic leading-6 text-ink-soft"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.4 }}
        >
          {hints[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
