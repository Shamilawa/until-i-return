import { Countdown } from "@/components/countdown/Countdown";
import { LocalTimes } from "@/components/countdown/LocalTimes";
import { NextLetterTimer } from "@/components/countdown/NextLetterTimer";
import { SweetMessage } from "@/components/countdown/SweetMessage";
import { WaitingScreen } from "@/components/countdown/WaitingScreen";
import { PEOPLE } from "@/lib/config";
import { nextUnlockSlot } from "@/lib/time";
import { logout } from "@/server/actions";
import { nextScheduledUnlock } from "@/server/letters";
import { requireRole } from "@/server/session";
import Link from "next/link";
import { getSettings, isHiddenFrom } from "@/server/settings";

export default async function HomePage() {
  const role = await requireRole();
  if (await isHiddenFrom(role)) return <WaitingScreen />;

  const [settings, scheduled] = await Promise.all([getSettings(), nextScheduledUnlock()]);

  // No letter queued yet: count down to the next letter day on the schedule.
  const nextUnlock =
    scheduled ??
    nextUnlockSlot(new Date(), {
      weekday: settings.letterWeekday,
      time: settings.letterTime,
      timezone: settings.timezone,
    });

  return (
    <>
      <header className="flex items-center justify-between px-1">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Hi, {role === "reader" ? PEOPLE.reader.nickname : PEOPLE.author.name} <span aria-hidden>✨</span>
        </h1>
        <form action={logout}>
          <button type="submit" className="min-h-11 rounded-full px-3 text-sm font-semibold text-ink-soft underline-offset-4 hover:underline">
            Sign out
          </button>
        </form>
      </header>

      {role === "author" && settings.journeyStartedAt === null && (
        <Link href="/admin/settings" className="card block border-gold/60 p-4 text-sm text-ink">
          <span className="font-display text-base font-semibold">{PEOPLE.reader.name} can&apos;t see any of this yet.</span>
          <br />
          She has a waiting screen until you tap <b>Start the journey</b> in Settings.
        </Link>
      )}

      <Countdown leaveAt={settings.leaveAt.toISOString()} reunionAt={settings.reunionAt.toISOString()} />
      <SweetMessage messages={settings.sweetMessages} />
      <NextLetterTimer unlockAt={nextUnlock.toISOString()} letterWaiting={scheduled !== null} />
      <LocalTimes />
    </>
  );
}
