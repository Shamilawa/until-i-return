import Link from "next/link";
import { Timeline, type TimelineItem } from "@/components/story/Timeline";
import { EmptyState } from "@/components/ui/EmptyState";
import { PEOPLE } from "@/lib/config";
import { formatInZone } from "@/lib/time";
import { withChapters } from "@/lib/timeline";
import { requireRole } from "@/server/session";
import { getSettings } from "@/server/settings";
import { listTimeline } from "@/server/timeline";

export default async function StoryPage() {
  const role = await requireRole();
  const [entries, settings] = await Promise.all([listTimeline(), getSettings()]);
  const leaveOn = formatInZone(settings.leaveAt, settings.timezone, "yyyy-MM-dd");

  const items: TimelineItem[] = withChapters(entries, leaveOn).map((entry) => ({
    id: entry.id,
    happenedOn: entry.happenedOn,
    title: entry.title,
    caption: entry.caption,
    location: entry.location,
    photoIds: entry.photoIds,
    chapter: entry.chapter,
    addedBy: entry.createdBy === role ? "you" : PEOPLE[entry.createdBy].name,
    manageLabel: entry.createdBy === role ? "Edit" : role === "author" ? "Remove" : null,
  }));

  return (
    <>
      <header className="flex items-center justify-between px-1">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Our Story</h1>
          <p className="text-sm text-ink-soft">Every chapter, from the day we met.</p>
        </div>
        {items.length > 0 && (
          <Link href="/story/new" className="btn btn-primary shrink-0">
            + Moment
          </Link>
        )}
      </header>

      {items.length === 0 ? (
        <EmptyState emoji="📖" title="The first page is blank…">
          <p>Every story needs a beginning. Ours has a date.</p>
          <Link href="/story/new" className="btn btn-primary mt-4">
            Add the day we met
          </Link>
        </EmptyState>
      ) : (
        <Timeline items={items} />
      )}
    </>
  );
}
