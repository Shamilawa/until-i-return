"use client";

import { useActionState, useState } from "react";
import { PaperCard } from "@/components/letters/PaperCard";
import { compressImage } from "@/lib/compress-image";
import { PEOPLE } from "@/lib/config";
import { removeLetter, saveLetter } from "@/server/actions";

type Props = {
  letter?: { id: string; title: string; body: string; photoId: string | null };
  /** datetime-local value in Sri Lanka time */
  defaultUnlockAt: string;
};

export function LetterForm({ letter, defaultUnlockAt }: Props) {
  const [state, formAction, pending] = useActionState(saveLetter, null);
  const [title, setTitle] = useState(letter?.title ?? "");
  const [body, setBody] = useState(letter?.body ?? "");
  const [unlockAt, setUnlockAt] = useState(defaultUnlockAt);
  const [preview, setPreview] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  async function onPhotoChange(file: File | undefined) {
    setPhotoError(null);
    setPhoto(null);
    if (!file) return;
    try {
      setPhoto(await compressImage(file));
    } catch {
      setPhotoError("That photo couldn't be read. Try a JPEG or PNG.");
    }
  }

  function submit(formData: FormData) {
    // Send the compressed copy, not the original file.
    formData.delete("photo");
    if (photo) formData.set("photo", photo);
    formAction(formData);
  }

  return (
    <div className="flex flex-col gap-4">
      <form action={submit} className="card flex flex-col gap-4">
        {letter && <input type="hidden" name="id" value={letter.id} />}

        <div>
          <label htmlFor="title" className="field-label">
            Title
          </label>
          <input
            id="title"
            name="title"
            className="field"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            required
          />
          <p className="mt-1 text-xs text-ink-soft">She only sees this once the letter opens.</p>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="body" className="field-label mb-0">
              Letter
            </label>
            <button type="button" className="min-h-11 px-2 text-sm font-semibold text-rose-deep" onClick={() => setPreview((p) => !p)}>
              {preview ? "Keep writing" : "Preview"}
            </button>
          </div>
          {/* Kept mounted while previewing so its value is still submitted. */}
          <textarea
            id="body"
            name="body"
            className="field min-h-64 leading-7"
            hidden={preview}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={`My dearest ${PEOPLE.reader.nickname}…`}
            required
          />
          {preview && <PaperCard title={title || "Untitled"} body={body || "*Nothing written yet.*"} />}
          <p className="mt-1 text-xs text-ink-soft">Markdown works: **bold**, *italic*, &gt; quote, blank line for a new paragraph.</p>
        </div>

        <div>
          <label htmlFor="unlockAt" className="field-label">
            Opens at ({PEOPLE.reader.city} time)
          </label>
          <input id="unlockAt" name="unlockAt" type="datetime-local" className="field"
            value={unlockAt}
            onChange={(e) => setUnlockAt(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="photo" className="field-label">
            Photo (optional)
          </label>
          {letter?.photoId && (
            <div className="mb-2 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/photos/${letter.photoId}`} alt="Current photo" className="h-16 w-16 rounded-xl object-cover" />
              <label className="flex min-h-11 items-center gap-2 text-sm text-ink">
                <input type="checkbox" name="removePhoto" className="h-5 w-5" /> Remove this photo
              </label>
            </div>
          )}
          <input
            id="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="field file:mr-3 file:rounded-full file:border-0 file:bg-lavender/60 file:px-3 file:py-1 file:font-display"
            onChange={(e) => onPhotoChange(e.target.files?.[0])}
          />
          {photo && <p className="mt-1 text-xs text-ink-soft">Ready to send ({Math.round(photo.size / 1024)} KB).</p>}
          {photoError && <p className="mt-1 text-xs font-semibold text-seal">{photoError}</p>}
        </div>

        {state?.error && (
          <p role="alert" className="rounded-2xl bg-seal/10 px-4 py-2 text-sm font-semibold text-seal">
            {state.error}
          </p>
        )}

        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Sealing…" : letter ? "Save changes" : "Seal and schedule"}
        </button>
      </form>

      {letter && <DeleteLetter id={letter.id} />}
    </div>
  );
}

function DeleteLetter({ id }: { id: string }) {
  const [armed, setArmed] = useState(false);
  return (
    <form action={removeLetter} className="flex justify-center gap-2">
      <input type="hidden" name="id" value={id} />
      {armed ? (
        <>
          <button type="submit" className="btn btn-danger">
            Yes, delete it
          </button>
          <button type="button" className="btn btn-soft" onClick={() => setArmed(false)}>
            Keep it
          </button>
        </>
      ) : (
        <button type="button" className="btn btn-soft text-seal" onClick={() => setArmed(true)}>
          Delete this letter
        </button>
      )}
    </form>
  );
}
