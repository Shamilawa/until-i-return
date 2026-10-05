import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";

const DAY_MS = 86_400_000;
const INPUT_FORMAT = "yyyy-MM-dd'T'HH:mm";

export interface LetterSchedule {
  /** 0 = Sunday ... 6 = Saturday */
  weekday: number;
  /** "HH:mm" */
  time: string;
  timezone: string;
}

/** The first scheduled unlock moment strictly after `after`. */
export function nextUnlockSlot(after: Date, { weekday, time, timezone }: LetterSchedule): Date {
  const local = toZonedTime(after, timezone);
  for (let offset = 0; offset <= 7; offset++) {
    const day = new Date(local.getFullYear(), local.getMonth(), local.getDate() + offset);
    if (day.getDay() !== weekday) continue;
    const ymd = `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`;
    const slot = fromZonedTime(`${ymd}T${time}:00`, timezone);
    if (slot.getTime() > after.getTime()) return slot;
  }
  throw new Error("No unlock slot found within a week");
}

/** The first upcoming slot that no existing letter already occupies. */
export function nextFreeSlot(taken: Date[], schedule: LetterSchedule, now: Date): Date {
  const used = new Set(taken.map((d) => d.getTime()));
  let slot = nextUnlockSlot(now, schedule);
  while (used.has(slot.getTime())) slot = nextUnlockSlot(slot, schedule);
  return slot;
}

export interface Progress {
  /** 0..1 share of the time apart that has passed */
  fraction: number;
  daysDown: number;
  daysToGo: number;
}

export function separationProgress(leaveAt: Date, reunionAt: Date, now: Date): Progress {
  const total = reunionAt.getTime() - leaveAt.getTime();
  const elapsed = now.getTime() - leaveAt.getTime();
  const fraction = total <= 0 ? 1 : Math.min(1, Math.max(0, elapsed / total));
  return {
    fraction,
    daysDown: Math.max(0, Math.floor(Math.min(elapsed, total) / DAY_MS)),
    daysToGo: Math.max(0, Math.ceil((reunionAt.getTime() - now.getTime()) / DAY_MS)),
  };
}

export interface DurationParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function splitDuration(ms: number): DurationParts {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86_400),
    hours: Math.floor((total % 86_400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

/** "3d 4h 12m" style label for small countdown chips. */
export function shortDuration(ms: number): string {
  const { days, hours, minutes, seconds } = splitDuration(ms);
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

/** Value for <input type="datetime-local">, expressed in `timezone`. */
export function toZonedInput(date: Date, timezone: string): string {
  return formatInTimeZone(date, timezone, INPUT_FORMAT);
}

/** Reads a datetime-local value as wall-clock time in `timezone`. */
export function fromZonedInput(value: string, timezone: string): Date {
  return fromZonedTime(value, timezone);
}

export function formatInZone(date: Date, timezone: string, pattern: string): string {
  return formatInTimeZone(date, timezone, pattern);
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}
