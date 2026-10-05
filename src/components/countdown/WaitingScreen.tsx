"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PEOPLE, WAITING_MESSAGE } from "@/lib/config";
import { Envelope } from "@/components/letters/Envelope";
import { logout } from "@/server/actions";

const CHECK_EVERY_MS = 20_000;

/** All she sees before take-off. It asks the server now and then, so it opens by itself once the journey starts. */
export function WaitingScreen() {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, CHECK_EVERY_MS);
    return () => clearInterval(id);
  }, [router]);

  return (
    <div className="flex min-h-[80dvh] flex-col items-center justify-center gap-6 text-center">
      <div className="animate-float">
        <Envelope state="unread" className="w-40" />
      </div>
      <div className="card flex flex-col gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink">
          {WAITING_MESSAGE.title}, {PEOPLE.reader.nickname} <span aria-hidden>✨</span>
        </h1>
        {WAITING_MESSAGE.lines.map((line) => (
          <p key={line} className="text-lg leading-7 text-ink">
            {line}
          </p>
        ))}
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
