"use client";

import { useActionState, useState } from "react";
import { compressImage } from "@/lib/compress-image";
import { MAX_ENTRY_PHOTOS } from "@/lib/timeline";
import { removeEntry, saveEntry } from "@/server/actions";

type Props = {
  entry?: { id: string; photoIds: string[] };
  defaults: { happenedOn: string; title: string; caption: string; location: string };
};

type NewPhoto = { file: File; previewUrl: string };

// Kept in step with MAX_ENTRY_UPLOAD_BYTES in the saveEntry action.
const MAX_UPLOAD_BYTES = 3.5 * 1024 * 1024;

export function EntryForm({ entry, defaults }: Props) {
  const [state, formAction, pending] = useActionState(saveEntry, null);
  const [happenedOn, setHappenedOn] = useState(defaults.happenedOn);
  const [title, setTitle] = useState(defaults.title);
  const [caption, setCaption] = useState(defaults.caption);
  const [location, setLocation] = useState(defaults.location);
  const [removed, setRemoved] = useState<string[]>([]);
  const [added, setAdded] = useState<NewPhoto[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const keptCount = (entry?.photoIds.length ?? 0) - removed.length;
  const room = MAX_ENTRY_PHOTOS - keptCount - added.length;

  async function addFiles(files: FileList | null) {
    setPhotoError(null);
    if (!files || files.length === 0) return;
    const picked = Array.from(files).slice(0, room);
    if (files.length > room) setPhotoError(`A moment can hold up to ${MAX_ENTRY_PHOTOS} photos.`);
    setBusy(true);
    try {
      // Smaller than letter photos, since up to five travel in one request.
      const compressed = await Promise.all(picked.map((file) => compressImage(file, 1280, 0.8)));
      const next = [...added, ...compressed.map((file) => ({ file, previewUrl: URL.createObjectURL(file) }))];
      if (next.reduce((sum, p) => sum + p.file.size, 0) > MAX_UPLOAD_BYTES) {
        setPhotoError("Those photos are too large together. Save these, then edit the moment to add more.");
        return;
      }
      setAdded(next);
    } catch {
      setPhotoError("One of those photos couldn't be read. Try a JPEG or PNG.");
    } finally {
      setBusy(false);
    }
  }

  function removeAdded(previewUrl: string) {
    URL.revokeObjectURL(previewUrl);
    setAdded((photos) => photos.filter((p) => p.previewUrl !== previewUrl));
  }

  function submit(formData: FormData) {
    formData.delete("photos");
    for (const photo of added) formData.append("photos", photo.file);
    for (const id of removed) formData.append("removePhoto", id);
    formAction(formData);
  }

  return (
    <div className="flex flex-col gap-4">
      <form action={submit} className="card flex flex-col gap-4">
        {entry && <input type="hidden" name="id" value={entry.id} />}

        <div>
          <label htmlFor="happenedOn" className="field-label">
            When
          </label>
          <input
            id="happenedOn"
            name="happenedOn"
            type="date"
            className="field"
            value={happenedOn}
            onChange={(e) => setHappenedOn(e.target.value)}
            required
          />
        </div>
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
            placeholder="Our first video call"
            required
          />
        </div>
        <div>
          <label htmlFor="caption" className="field-label">
            A few words (optional)
          </label>
          <textarea
            id="caption"
            name="caption"
            className="field min-h-28 leading-7"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={600}
          />
        </div>
        <div>
          <label htmlFor="location" className="field-label">
            Where (optional)
          </label>
          <input
            id="location"
            name="location"
            className="field"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            maxLength={120}
          />
        </div>

        <div>
          <p className="field-label">
            Photos ({keptCount + added.length} of {MAX_ENTRY_PHOTOS})
          </p>
          <ul className="grid grid-cols-3 gap-2">
            {entry?.photoIds
              .filter((id) => !removed.includes(id))
              .map((id) => (
                <Thumb key={id} src={`/api/photos/${id}`} onRemove={() => setRemoved((ids) => [...ids, id])} />
              ))}
            {added.map((photo) => (
              <Thumb key={photo.previewUrl} src={photo.previewUrl} onRemove={() => removeAdded(photo.previewUrl)} />
            ))}
            {room > 0 && (
              <li>
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-rose/70 bg-white/60 text-center font-display text-sm text-ink-soft focus-within:ring-2 focus-within:ring-rose">
                  <span aria-hidden className="text-2xl leading-none">
                    +
                  </span>
                  {busy ? "Adding…" : "Add photos"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="sr-only"
                    disabled={busy}
                    onChange={(e) => {
                      void addFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>
              </li>
            )}
          </ul>
          {photoError && <p className="mt-2 text-xs font-semibold text-seal">{photoError}</p>}
        </div>

        {state?.error && (
          <p role="alert" className="rounded-2xl bg-seal/10 px-4 py-2 text-sm font-semibold text-seal">
            {state.error}
          </p>
        )}

        <button type="submit" className="btn btn-primary" disabled={pending || busy}>
          {pending ? "Saving…" : entry ? "Save changes" : "Add to our story"}
        </button>
      </form>

      {entry && <DeleteEntry id={entry.id} />}
    </div>
  );
}

function Thumb({ src, onRemove }: { src: string; onRemove: () => void }) {
  return (
    <li className="relative aspect-square overflow-hidden rounded-2xl bg-white/60">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="h-full w-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove this photo"
        className="absolute right-0 top-0 flex h-11 w-11 items-start justify-end p-1"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink/75 text-lg leading-none text-white">×</span>
      </button>
    </li>
  );
}

export function DeleteEntry({ id }: { id: string }) {
  const [armed, setArmed] = useState(false);
  return (
    <form action={removeEntry} className="flex justify-center gap-2">
      <input type="hidden" name="id" value={id} />
      {armed ? (
        <>
          <button type="submit" className="btn btn-danger">
            Yes, remove it
          </button>
          <button type="button" className="btn btn-soft" onClick={() => setArmed(false)}>
            Keep it
          </button>
        </>
      ) : (
        <button type="button" className="btn btn-soft text-seal" onClick={() => setArmed(true)}>
          Remove this moment
        </button>
      )}
    </form>
  );
}
