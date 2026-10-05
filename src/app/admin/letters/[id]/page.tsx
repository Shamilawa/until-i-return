import { notFound } from "next/navigation";
import { z } from "zod";
import { toZonedInput } from "@/lib/time";
import { getLetterForAuthor } from "@/server/letters";
import { requireAuthor } from "@/server/session";
import { getSettings } from "@/server/settings";
import { LetterForm } from "../LetterForm";

export default async function EditLetterPage({ params }: PageProps<"/admin/letters/[id]">) {
  await requireAuthor();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const [letter, settings] = await Promise.all([getLetterForAuthor(id), getSettings()]);
  if (!letter) notFound();

  return (
    <>
      <h1 className="px-1 font-display text-2xl font-semibold text-ink">Edit letter</h1>
      {letter.firstOpenedAt && (
        <p className="card p-3 text-sm text-ink">She has already read this one. Changes will show if she rereads it.</p>
      )}
      <LetterForm
        letter={{ id: letter.id, title: letter.title, body: letter.body, photoId: letter.photoId }}
        defaultUnlockAt={toZonedInput(letter.unlockAt, settings.timezone)}
      />
    </>
  );
}
