import "server-only";
import { and, asc, eq, gt, isNull, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { letters, photos, readerLetters, timelinePhotos } from "@/db/schema";
import { deleteStoredPhotos } from "./storage";

// ---------------------------------------------------------------------------
// Reader side. Everything here goes through the reader_letters view, which
// nulls title, body and photo until the database clock passes unlock_at.
// ---------------------------------------------------------------------------

export type EnvelopeSummary = {
  id: string;
  unlockAt: Date;
  isUnlocked: boolean;
  weekNumber: number;
  title: string | null;
  isRead: boolean;
};

export async function listEnvelopes(): Promise<EnvelopeSummary[]> {
  const rows = await db
    .select({
      id: readerLetters.id,
      unlockAt: readerLetters.unlockAt,
      isUnlocked: readerLetters.isUnlocked,
      weekNumber: readerLetters.weekNumber,
      title: readerLetters.title,
      firstOpenedAt: readerLetters.firstOpenedAt,
    })
    .from(readerLetters)
    .orderBy(asc(readerLetters.unlockAt));
  return rows.map(({ firstOpenedAt, ...row }) => ({ ...row, isRead: firstOpenedAt !== null }));
}

/** An unlocked letter, or null if it is locked or does not exist. The caller cannot tell which. */
export async function getOpenLetter(id: string) {
  const [row] = await db
    .select()
    .from(readerLetters)
    .where(and(eq(readerLetters.id, id), eq(readerLetters.isUnlocked, true)));
  return row ?? null;
}

/** Records the first time she opens a letter. Does nothing for a locked one. */
export async function markOpened(id: string): Promise<void> {
  await db
    .update(letters)
    .set({ firstOpenedAt: sql`now()` })
    .where(and(eq(letters.id, id), isNull(letters.firstOpenedAt), sql`${letters.unlockAt} <= now()`));
}

/** When the next sealed letter opens, if one is waiting. Reveals a time only. */
export async function nextScheduledUnlock(): Promise<Date | null> {
  const [row] = await db
    .select({ unlockAt: letters.unlockAt })
    .from(letters)
    .where(gt(letters.unlockAt, sql`now()`))
    .orderBy(asc(letters.unlockAt))
    .limit(1);
  return row?.unlockAt ?? null;
}

/** Whether the reader may load this photo: it is on the timeline or on an unlocked letter. */
export async function readerCanSeePhoto(photoId: string): Promise<boolean> {
  const [onLetter] = await db
    .select({ id: readerLetters.id })
    .from(readerLetters)
    .where(eq(readerLetters.photoId, photoId))
    .limit(1);
  if (onLetter) return true;
  const [onTimeline] = await db
    .select({ id: timelinePhotos.photoId })
    .from(timelinePhotos)
    .where(eq(timelinePhotos.photoId, photoId))
    .limit(1);
  return Boolean(onTimeline);
}

// ---------------------------------------------------------------------------
// Author side. Callers must have passed requireAuthor().
// ---------------------------------------------------------------------------

export type Letter = typeof letters.$inferSelect;

export async function listLettersForAuthor(): Promise<Letter[]> {
  return db.select().from(letters).orderBy(asc(letters.unlockAt));
}

export async function getLetterForAuthor(id: string): Promise<Letter | null> {
  const [row] = await db.select().from(letters).where(eq(letters.id, id));
  return row ?? null;
}

export async function listUnlockTimes(): Promise<Date[]> {
  const rows = await db.select({ unlockAt: letters.unlockAt }).from(letters);
  return rows.map((r) => r.unlockAt);
}

type LetterInput = { title: string; body: string; unlockAt: Date; photoId?: string | null };

export async function createLetter(input: LetterInput): Promise<string> {
  const [row] = await db.insert(letters).values(input).returning({ id: letters.id });
  return row.id;
}

export async function updateLetter(id: string, input: LetterInput): Promise<void> {
  await db
    .update(letters)
    .set({ ...input, updatedAt: sql`now()` })
    .where(eq(letters.id, id));
}

export async function deleteLetter(id: string): Promise<void> {
  const [row] = await db.delete(letters).where(eq(letters.id, id)).returning({ photoId: letters.photoId });
  if (row?.photoId) await deletePhoto(row.photoId);
}

export async function createPhoto(blobUrl: string, contentType: string): Promise<string> {
  const [row] = await db.insert(photos).values({ blobUrl, contentType }).returning({ id: photos.id });
  return row.id;
}

export async function deletePhoto(id: string): Promise<void> {
  const [row] = await db.delete(photos).where(eq(photos.id, id)).returning({ blobUrl: photos.blobUrl });
  if (row) await deleteStoredPhotos([row.blobUrl]);
}

export async function getPhoto(id: string) {
  const [row] = await db.select().from(photos).where(eq(photos.id, id));
  return row ?? null;
}
