"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { FormState, LoginState } from "@/lib/form-state";
import { fromZonedInput } from "@/lib/time";
import { verifyCredentials } from "./auth";
import {
  createLetter,
  createPhoto,
  deleteLetter,
  deletePhoto,
  getLetterForAuthor,
  markOpened,
  updateLetter,
} from "./letters";
import { resetReaderActivity, wipeEverything } from "./reset";
import { createSession, destroySession, getRole, requireAuthor } from "./session";
import { getSettings, updateSettings } from "./settings";
import { isAcceptablePhoto, storePhoto } from "./storage";

const zonedDateTime = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Pick a date and time");

// --- Auth -------------------------------------------------------------------

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const role = verifyCredentials(username, password);
  if (!role) {
    // Slow down guessing.
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { error: "That's not the secret knock. Try again?", username };
  }
  await createSession(role);
  redirect("/");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/login");
}

// --- Letters ----------------------------------------------------------------

const letterSchema = z.object({
  id: z.uuid().optional(),
  title: z.string().trim().min(1, "Give the letter a title").max(120),
  body: z.string().trim().min(1, "The letter is empty").max(20_000),
  unlockAt: zonedDateTime,
});

export async function saveLetter(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAuthor();
  const parsed = letterSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    body: formData.get("body"),
    unlockAt: formData.get("unlockAt"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { id, title, body } = parsed.data;

  const { timezone } = await getSettings();
  const unlockAt = fromZonedInput(parsed.data.unlockAt, timezone);

  const existing = id ? await getLetterForAuthor(id) : null;
  if (id && !existing) return { error: "That letter no longer exists." };

  let photoId = existing?.photoId ?? null;
  const oldPhotoId = photoId;
  const file = formData.get("photo");
  if (file instanceof File && file.size > 0) {
    if (!isAcceptablePhoto(file)) return { error: "The photo must be a JPEG, PNG or WebP under 3 MB." };
    photoId = await createPhoto(await storePhoto(file), file.type);
  } else if (formData.get("removePhoto") === "on") {
    photoId = null;
  }

  if (id) await updateLetter(id, { title, body, unlockAt, photoId });
  else await createLetter({ title, body, unlockAt, photoId });
  if (oldPhotoId && oldPhotoId !== photoId) await deletePhoto(oldPhotoId);

  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function removeLetter(formData: FormData): Promise<void> {
  await requireAuthor();
  const id = z.uuid().safeParse(formData.get("id"));
  if (id.success) await deleteLetter(id.data);
  revalidatePath("/", "layout");
  redirect("/admin");
}

/** Called when she breaks the seal. Only the reader's opening counts as "read". */
export async function openLetter(id: string): Promise<void> {
  if ((await getRole()) !== "reader") return;
  if (!z.uuid().safeParse(id).success) return;
  await markOpened(id);
  revalidatePath("/letters");
}

// --- Settings ---------------------------------------------------------------

const settingsSchema = z.object({
  metOn: z.iso.date("Pick the day you met"),
  leaveAt: zonedDateTime,
  reunionAt: zonedDateTime,
  letterWeekday: z.coerce.number().int().min(0).max(6),
  letterTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Pick a letter time"),
  sweetMessages: z.string(),
});

export async function saveSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAuthor();
  const parsed = settingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { timezone } = await getSettings();
  const leaveAt = fromZonedInput(parsed.data.leaveAt, timezone);
  const reunionAt = fromZonedInput(parsed.data.reunionAt, timezone);
  if (reunionAt <= leaveAt) return { error: "The reunion has to come after the day you leave." };

  await updateSettings({
    metOn: parsed.data.metOn,
    leaveAt,
    reunionAt,
    letterWeekday: parsed.data.letterWeekday,
    letterTime: parsed.data.letterTime,
    timezone,
    sweetMessages: parsed.data.sweetMessages
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  });
  revalidatePath("/", "layout");
  return { success: "Saved." };
}

// --- Reset ------------------------------------------------------------------

export async function resetActivity(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAuthor();
  if (formData.get("confirm") !== "RESET") return { error: "Type RESET to confirm." };
  await resetReaderActivity();
  revalidatePath("/", "layout");
  return { success: "Done. Every letter looks unopened again." };
}

export async function wipeAll(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAuthor();
  if (formData.get("confirm") !== "WIPE") return { error: "Type WIPE to confirm." };
  await wipeEverything();
  revalidatePath("/", "layout");
  return { success: "Everything is wiped and the dates are back to their defaults." };
}
