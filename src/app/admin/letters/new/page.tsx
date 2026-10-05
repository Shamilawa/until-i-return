import { nextFreeSlot, toZonedInput } from "@/lib/time";
import { listUnlockTimes } from "@/server/letters";
import { requireAuthor } from "@/server/session";
import { getSettings } from "@/server/settings";
import { LetterForm } from "../LetterForm";

export default async function NewLetterPage() {
  await requireAuthor();
  const [settings, taken] = await Promise.all([getSettings(), listUnlockTimes()]);
  // Pre-fill the next letter day that has nothing scheduled, so weeks can be written in a row.
  const slot = nextFreeSlot(
    taken,
    { weekday: settings.letterWeekday, time: settings.letterTime, timezone: settings.timezone },
    new Date(),
  );

  return (
    <>
      <h1 className="px-1 font-display text-2xl font-semibold text-ink">A new letter</h1>
      <LetterForm defaultUnlockAt={toZonedInput(slot, settings.timezone)} />
    </>
  );
}
