import { resetActivity, wipeAll } from "@/server/actions";
import { requireAuthor } from "@/server/session";
import { getSettings } from "@/server/settings";
import { PEOPLE } from "@/lib/config";
import { formatInZone, toZonedInput } from "@/lib/time";
import { ConfirmForm } from "./ConfirmForm";
import { JourneyControl } from "./JourneyControl";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  await requireAuthor();
  const settings = await getSettings();

  return (
    <>
      <h1 className="px-1 font-display text-2xl font-semibold text-ink">Settings</h1>
      <JourneyControl
        readerName={PEOPLE.reader.name}
        startedLabel={
          settings.journeyStartedAt
            ? formatInZone(settings.journeyStartedAt, settings.timezone, "EEE d MMM, h:mm a")
            : null
        }
      />
      <SettingsForm
        metOn={settings.metOn}
        leaveAt={toZonedInput(settings.leaveAt, settings.timezone)}
        reunionAt={toZonedInput(settings.reunionAt, settings.timezone)}
        letterWeekday={settings.letterWeekday}
        letterTime={settings.letterTime}
        sweetMessages={settings.sweetMessages.join("\n")}
      />

      <section className="card flex flex-col gap-5 border-seal/30">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">After testing</h2>
          <p className="text-sm text-ink-soft">Neither of these can be undone.</p>
        </div>
        <ConfirmForm
          action={resetActivity}
          word="RESET"
          title="Reset her activity"
          description="Every letter looks unopened again: clears read status, hearts and replies. Your letters stay."
          button="Reset activity"
        />
        <hr className="border-white/80" />
        <ConfirmForm
          action={wipeAll}
          word="WIPE"
          title="Wipe everything"
          description="Deletes all letters and photos, and puts the dates, schedule and sweet messages back to their defaults. She goes back to the waiting screen."
          button="Wipe everything"
        />
      </section>
    </>
  );
}
