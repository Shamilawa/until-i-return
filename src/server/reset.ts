import "server-only";
import { db } from "@/db/client";
import { letters, photos, settings, timelineEntries, timelinePhotos } from "@/db/schema";
import { DEFAULT_SETTINGS } from "@/lib/config";
import { deleteStoredPhotos } from "./storage";

/** Makes every letter look unopened again. The letters themselves are kept. */
export async function resetReaderActivity(): Promise<void> {
  await db.update(letters).set({ firstOpenedAt: null, reaction: null, replyNote: null, repliedAt: null });
}

/** Deletes all letters and photos, and restores the default dates. */
export async function wipeEverything(): Promise<void> {
  const blobUrls = await db.transaction(async (tx) => {
    const stored = await tx.select({ blobUrl: photos.blobUrl }).from(photos);
    // The timeline tables are unused by the app but still exist; keep them empty too.
    await tx.delete(timelinePhotos);
    await tx.delete(timelineEntries);
    await tx.delete(letters);
    await tx.delete(photos);
    await tx
      .insert(settings)
      .values({ id: 1, ...DEFAULT_SETTINGS })
      .onConflictDoUpdate({ target: settings.id, set: DEFAULT_SETTINGS });
    return stored.map((p) => p.blobUrl);
  });
  await deleteStoredPhotos(blobUrls);
}
