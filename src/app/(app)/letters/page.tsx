import { EnvelopeCard } from "@/components/letters/EnvelopeCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { listEnvelopes } from "@/server/letters";
import { redirect } from "next/navigation";
import { requireRole } from "@/server/session";
import { isHiddenFrom } from "@/server/settings";

export default async function LetterboxPage() {
  const role = await requireRole();
  if (await isHiddenFrom(role)) redirect("/");
  // Both of us see the letterbox exactly as she does: locked letters carry no title or text.
  const envelopes = await listEnvelopes();
  const unlocked = envelopes.filter((e) => e.isUnlocked).reverse();
  const locked = envelopes.filter((e) => !e.isUnlocked);

  return (
    <>
      <header className="px-1">
        <h1 className="font-display text-2xl font-semibold text-ink">Letterbox</h1>
        <p className="text-sm text-ink-soft">
          {role === "author" ? "This is how she sees it." : "A new letter arrives every week."}
        </p>
      </header>

      {envelopes.length === 0 ? (
        <EmptyState emoji="✉️" title="No letters yet…">
          The mailman is on his way.
        </EmptyState>
      ) : (
        <>
          {/* Readable letters first: the sealed ones can run to 26 envelopes. */}
          <Section title="Yours to read" items={unlocked} />
          <Section title="Waiting for you" items={locked} />
        </>
      )}
    </>
  );
}

function Section({ title, items }: { title: string; items: Awaited<ReturnType<typeof listEnvelopes>> }) {
  if (items.length === 0) return null;
  return (
    <section>
      <h2 className="mb-2 px-1 font-display text-sm font-medium uppercase tracking-widest text-ink-soft">{title}</h2>
      <ul className="grid grid-cols-2 gap-3">
        {items.map((e) => (
          <li key={e.id}>
            <EnvelopeCard
              id={e.id}
              unlockAt={e.unlockAt.toISOString()}
              isUnlocked={e.isUnlocked}
              weekNumber={e.weekNumber}
              title={e.title}
              isRead={e.isRead}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
