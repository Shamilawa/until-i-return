import { differenceInMonths, format, parseISO } from "date-fns";

export const MAX_ENTRY_PHOTOS = 5;

/**
 * The divider an entry sits under: the calendar month before the leave date,
 * "Month N apart" from the leave date onwards. Dates are "yyyy-MM-dd".
 */
export function chapterLabel(happenedOn: string, leaveOn: string): string {
  const day = parseISO(happenedOn);
  const leave = parseISO(leaveOn);
  if (day < leave) return format(day, "MMMM yyyy");
  return `Month ${differenceInMonths(day, leave) + 1} apart ✨`;
}

/** Adds `chapter` to the first entry of each chapter so the list can draw dividers. */
export function withChapters<T extends { happenedOn: string }>(entries: T[], leaveOn: string): (T & { chapter: string | null })[] {
  let previous: string | null = null;
  return entries.map((entry) => {
    const label = chapterLabel(entry.happenedOn, leaveOn);
    const chapter = label === previous ? null : label;
    previous = label;
    return { ...entry, chapter };
  });
}
