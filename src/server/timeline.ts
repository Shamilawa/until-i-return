import "server-only";
import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { timelineEntries, timelinePhotos } from "@/db/schema";
import type { Role } from "@/lib/config";
import { createPhoto, deletePhoto } from "./letters";

export type TimelineEntry = typeof timelineEntries.$inferSelect & { photoIds: string[] };

async function photoIdsByEntry(entryIds: string[]): Promise<Map<string, string[]>> {
  const byEntry = new Map<string, string[]>();
  if (entryIds.length === 0) return byEntry;
  const rows = await db
    .select()
    .from(timelinePhotos)
    .where(inArray(timelinePhotos.entryId, entryIds))
    .orderBy(asc(timelinePhotos.sortOrder));
  for (const row of rows) byEntry.set(row.entryId, [...(byEntry.get(row.entryId) ?? []), row.photoId]);
  return byEntry;
}

/** Every moment, oldest first, with its photos in order. */
export async function listTimeline(): Promise<TimelineEntry[]> {
  const entries = await db
    .select()
    .from(timelineEntries)
    .orderBy(asc(timelineEntries.happenedOn), asc(timelineEntries.createdAt));
  const photos = await photoIdsByEntry(entries.map((e) => e.id));
  return entries.map((entry) => ({ ...entry, photoIds: photos.get(entry.id) ?? [] }));
}

export async function getTimelineEntry(id: string): Promise<TimelineEntry | null> {
  const [entry] = await db.select().from(timelineEntries).where(eq(timelineEntries.id, id));
  if (!entry) return null;
  const photos = await photoIdsByEntry([id]);
  return { ...entry, photoIds: photos.get(id) ?? [] };
}

type EntryFields = { happenedOn: string; title: string; caption: string | null; location: string | null };
type NewPhoto = { blobUrl: string; contentType: string };

async function attachPhotos(entryId: string, photos: NewPhoto[], startAt: number): Promise<void> {
  for (const [i, photo] of photos.entries()) {
    const photoId = await createPhoto(photo.blobUrl, photo.contentType);
    await db.insert(timelinePhotos).values({ entryId, photoId, sortOrder: startAt + i });
  }
}

export async function createTimelineEntry(fields: EntryFields, createdBy: Role, photos: NewPhoto[]): Promise<void> {
  const [entry] = await db
    .insert(timelineEntries)
    .values({ ...fields, createdBy })
    .returning({ id: timelineEntries.id });
  await attachPhotos(entry.id, photos, 0);
}

/** Updates the text, drops `removePhotoIds` (only those on this entry) and appends new photos. */
export async function updateTimelineEntry(
  entry: TimelineEntry,
  fields: EntryFields,
  removePhotoIds: string[],
  photos: NewPhoto[],
): Promise<void> {
  await db.update(timelineEntries).set(fields).where(eq(timelineEntries.id, entry.id));
  for (const photoId of removePhotoIds.filter((id) => entry.photoIds.includes(id))) await deletePhoto(photoId);
  await attachPhotos(entry.id, photos, entry.photoIds.length);
}

export async function deleteTimelineEntry(entry: TimelineEntry): Promise<void> {
  await db.delete(timelineEntries).where(eq(timelineEntries.id, entry.id));
  for (const photoId of entry.photoIds) await deletePhoto(photoId);
}
