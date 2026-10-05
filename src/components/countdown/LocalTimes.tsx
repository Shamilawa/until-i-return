"use client";

import { PEOPLE } from "@/lib/config";
import { formatInZone } from "@/lib/time";
import { useNow } from "@/lib/use-now";

export function LocalTimes() {
  const now = useNow();
  return (
    <section className="grid grid-cols-2 gap-3" aria-label="Our local times">
      <Clock now={now} who={PEOPLE.author.name} city={PEOPLE.author.city} timeZone={PEOPLE.author.timeZone} />
      <Clock now={now} who={PEOPLE.reader.name} city={PEOPLE.reader.city} timeZone={PEOPLE.reader.timeZone} />
    </section>
  );
}

function Clock({ now, who, city, timeZone }: { now: number | null; who: string; city: string; timeZone: string }) {
  const date = now === null ? null : new Date(now);
  const hour = date ? Number(formatInZone(date, timeZone, "H")) : 12;
  const isDay = hour >= 6 && hour < 18;

  return (
    <div className="card flex flex-col items-center gap-1 p-4 text-center">
      {isDay ? <Sun /> : <Moon />}
      <p className="font-display text-2xl font-semibold tabular-nums text-ink">
        {date ? formatInZone(date, timeZone, "h:mm a") : "--:--"}
      </p>
      <p className="text-xs font-semibold text-ink-soft">
        {date ? formatInZone(date, timeZone, "EEE") : " "} · {city}
      </p>
      <p className="font-display text-sm text-ink">{who}</p>
    </div>
  );
}

function Sun() {
  return (
    <svg viewBox="0 0 32 32" width="32" height="32" role="img" aria-label="Daytime">
      <g stroke="#f2b63c" strokeWidth="2.2" strokeLinecap="round">
        <path d="M16 2v4M16 26v4M2 16h4M26 16h4M6 6l2.8 2.8M23.2 23.2 26 26M6 26l2.8-2.8M23.2 8.8 26 6" />
      </g>
      <circle cx="16" cy="16" r="7" fill="#f8cf5f" />
    </svg>
  );
}

function Moon() {
  return (
    <svg viewBox="0 0 32 32" width="32" height="32" role="img" aria-label="Night-time">
      <path d="M22 4a12 12 0 1 0 6 20A13 13 0 0 1 22 4z" fill="#8f83c9" />
      <path d="M8 6l.8 2.2L11 9l-2.2.8L8 12l-.8-2.2L5 9l2.2-.8z" fill="#f2b63c" />
    </svg>
  );
}
