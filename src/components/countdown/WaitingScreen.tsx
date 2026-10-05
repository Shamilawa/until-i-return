"use client";

import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { PEOPLE, WAITING_MESSAGE } from "@/lib/config";
import { Envelope } from "@/components/letters/Envelope";
import { logout } from "@/server/actions";

const CHECK_EVERY_MS = 20_000;

/** All she sees before take-off. It also asks the server now and then, so it opens by itself once the journey starts. */
export function WaitingScreen() {
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, CHECK_EVERY_MS);
    return () => clearInterval(id);
  }, [router]);

  return (
    <div className="flex min-h-[80dvh] flex-col items-center justify-center gap-5 text-center">
      <div className="animate-float">
        <Envelope state="unread" className="w-36" />
      </div>

      <div className="card flex flex-col gap-4">
        <h1 className="font-display text-2xl font-semibold text-ink">
          {WAITING_MESSAGE.title}, {PEOPLE.reader.nickname} <span aria-hidden>✨</span>
        </h1>
        <p className="text-lg leading-7 text-ink">{WAITING_MESSAGE.intro}</p>

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
            {WAITING_MESSAGE.inside.map((item) => (
              <li key={item.text} className="flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-2.5 text-ink">
                <span aria-hidden className="text-xl">
                  {item.emoji}
                </span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>

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
  );
}
