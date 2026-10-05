import "server-only";
import { cache } from "react";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { settings } from "@/db/schema";
import { DEFAULT_SETTINGS, type Role } from "@/lib/config";

export type Settings = typeof settings.$inferSelect;

/** The single settings row, created with defaults the first time it is needed. */
export const getSettings = cache(async (): Promise<Settings> => {
  const [row] = await db.select().from(settings).where(eq(settings.id, 1));
  if (row) return row;
  await db.insert(settings).values({ id: 1, ...DEFAULT_SETTINGS }).onConflictDoNothing();
  const [created] = await db.select().from(settings).where(eq(settings.id, 1));
  return created;
});

/** Saves the editable settings. Whether the journey has started is changed only by setJourneyStarted. */
export async function updateSettings(values: Omit<Settings, "id" | "journeyStartedAt">): Promise<void> {
  await db
    .insert(settings)
    .values({ id: 1, ...values })
    .onConflictDoUpdate({ target: settings.id, set: values });
}

export async function setJourneyStarted(started: boolean): Promise<void> {
  await getSettings();
  await db
    .update(settings)
    .set({ journeyStartedAt: started ? sql`now()` : null })
    .where(eq(settings.id, 1));
}

/** True while the reader must be kept on the waiting screen: countdown and letters are hidden from her. */
export async function isHiddenFrom(role: Role): Promise<boolean> {
  return role === "reader" && (await getSettings()).journeyStartedAt === null;
}
