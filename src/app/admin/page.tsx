import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { PEOPLE } from "@/lib/config";
import { formatInZone } from "@/lib/time";
import { listLettersForAuthor, type Letter } from "@/server/letters";
import { requireAuthor } from "@/server/session";
import { getSettings } from "@/server/settings";

export default async function AdminLettersPage() {
  await requireAuthor();
  const [letters, settings] = await Promise.all([listLettersForAuthor(), getSettings()]);
  const now = new Date();

  return (
    <>
      <header className="flex items-center justify-between px-1">
        <h1 className="font-display text-2xl font-semibold text-ink">Your letters</h1>
        <Link href="/admin/letters/new" className="btn btn-primary">
          + Write
        </Link>
      </header>

      {letters.length === 0 ? (
        <EmptyState emoji="🖋️" title="Nothing written yet">
          Write the first few before you fly. Each one is scheduled for the next free letter day.
        </EmptyState>
      ) : (
        <ul className="flex flex-col gap-3">
          {letters.map((letter) => (
            <li key={letter.id}>
              <Link href={`/admin/letters/${letter.id}`} className="card block p-4 transition-transform active:scale-[0.98]">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-display text-lg font-semibold text-ink">{letter.title}</p>
                  <Status letter={letter} now={now} />
                </div>
                <p className="mt-1 text-sm text-ink-soft">
                  Opens {formatInZone(letter.unlockAt, settings.timezone, "EEE d MMM yyyy, h:mm a")} ({PEOPLE.reader.city})
                </p>
                {letter.replyNote && (
                  <p className="mt-2 rounded-2xl bg-white/70 px-3 py-2 text-sm text-ink">
                    {letter.reaction && <span aria-hidden>{letter.reaction} </span>}“{letter.replyNote}”
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function Status({ letter, now }: { letter: Letter; now: Date }) {
  const [label, tone] = letter.firstOpenedAt
    ? ["Read", "bg-gold/30"]
    : letter.unlockAt <= now
      ? ["Delivered", "bg-rose/30"]
      : ["Sealed", "bg-lavender/60"];
  return <span className={`shrink-0 rounded-full px-3 py-0.5 text-xs font-bold text-ink ${tone}`}>{label}</span>;
}
