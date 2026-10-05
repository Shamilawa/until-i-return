import Link from "next/link";
import { PEOPLE } from "@/lib/config";
import { formatInZone } from "@/lib/time";
import { requireRole } from "@/server/session";
import { getSettings } from "@/server/settings";
import { listTimeline } from "@/server/timeline";
import { EntryForm } from "../EntryForm";

export default async function NewEntryPage() {
  const role = await requireRole();
  const [entries, settings] = await Promise.all([listTimeline(), getSettings()]);

  // The very first entry is the day we met; after that, default to today where this person is.
  const first = entries.length === 0;
  const defaults = {
    happenedOn: first ? settings.metOn : formatInZone(new Date(), PEOPLE[role].timeZone, "yyyy-MM-dd"),
    title: first ? "The day we met" : "",
    caption: "",
    location: "",
  };

  return (
    <>
      <Link href="/story" className="inline-flex min-h-11 items-center gap-1 self-start px-1 font-display text-ink-soft">
        <span aria-hidden>‹</span> Our Story
      </Link>
      <h1 className="px-1 font-display text-2xl font-semibold text-ink">A new moment</h1>
      <EntryForm defaults={defaults} />
    </>
  );
}
