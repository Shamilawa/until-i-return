import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { PEOPLE } from "@/lib/config";
import { requireRole } from "@/server/session";
import { getTimelineEntry } from "@/server/timeline";
import { DeleteEntry, EntryForm } from "../EntryForm";

export default async function ManageEntryPage({ params }: PageProps<"/story/[id]">) {
  const role = await requireRole();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const entry = await getTimelineEntry(id);
  if (!entry) notFound();
  const own = entry.createdBy === role;
  // Each of us edits our own moments; the author may also remove hers.
  if (!own && role !== "author") notFound();

  return (
    <>
      <Link href="/story" className="inline-flex min-h-11 items-center gap-1 self-start px-1 font-display text-ink-soft">
        <span aria-hidden>‹</span> Our Story
      </Link>
      {own ? (
        <>
          <h1 className="px-1 font-display text-2xl font-semibold text-ink">Edit moment</h1>
          <EntryForm
            entry={{ id: entry.id, photoIds: entry.photoIds }}
            defaults={{
              happenedOn: entry.happenedOn,
              title: entry.title,
              caption: entry.caption ?? "",
              location: entry.location ?? "",
            }}
          />
        </>
      ) : (
        <>
          <h1 className="px-1 font-display text-2xl font-semibold text-ink">{entry.title}</h1>
          <p className="card p-4 text-sm text-ink">
            {PEOPLE[entry.createdBy].name} added this moment, so only she can edit it. You can remove it.
          </p>
          <DeleteEntry id={entry.id} />
        </>
      )}
    </>
  );
}
