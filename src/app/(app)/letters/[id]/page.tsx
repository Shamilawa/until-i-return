import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { LetterReveal } from "@/components/letters/LetterReveal";
import { PaperCard } from "@/components/letters/PaperCard";
import { PEOPLE } from "@/lib/config";
import { formatInZone } from "@/lib/time";
import { getOpenLetter } from "@/server/letters";
import { requireRole } from "@/server/session";

export default async function LetterPage({ params }: PageProps<"/letters/[id]">) {
  await requireRole();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  // Returns nothing for a locked letter, so its text can never be rendered here.
  const letter = await getOpenLetter(id);
  if (!letter) notFound();

  return (
    <>
      <Link href="/letters" className="inline-flex min-h-11 items-center gap-1 self-start px-1 font-display text-ink-soft">
        <span aria-hidden>‹</span> Letterbox
      </Link>
      <LetterReveal letterId={letter.id} sealed={letter.firstOpenedAt === null}>
        <PaperCard
          title={letter.title ?? ""}
          body={letter.body ?? ""}
          dateLabel={formatInZone(letter.unlockAt, PEOPLE.reader.timeZone, "EEEE, d MMMM yyyy")}
          photoSrc={letter.photoId ? `/api/photos/${letter.photoId}` : null}
        />
      </LetterReveal>
    </>
  );
}
