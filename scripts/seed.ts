/**
 * Sample data for local testing: a few letters (read, unread, opening in a few
 * minutes, and locked for coming weeks).
 * Run with: npm run db:seed
 * Use "Wipe everything" in the admin settings to clear it afterwards.
 */
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { letters, settings } from "../src/db/schema";
import { DEFAULT_SETTINGS, PEOPLE } from "../src/lib/config";
import { nextUnlockSlot } from "../src/lib/time";

config({ path: ".env.local" });

const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const client = postgres(url, { prepare: false, max: 1 });
const db = drizzle(client);

const now = new Date();
const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000);
const schedule = {
  weekday: DEFAULT_SETTINGS.letterWeekday,
  time: DEFAULT_SETTINGS.letterTime,
  timezone: DEFAULT_SETTINGS.timezone,
};
const week1 = nextUnlockSlot(now, schedule);
const week2 = nextUnlockSlot(week1, schedule);
const week3 = nextUnlockSlot(week2, schedule);

async function main() {
  await db.insert(settings).values({ id: 1, ...DEFAULT_SETTINGS }).onConflictDoNothing();

  await db.insert(letters).values([
    {
      title: "Before I even left",
      body: `My ${PEOPLE.reader.nickname},\n\nI'm writing this one early, so you have something to open on the very first day.\n\n**Six months** sounds long. It's really just twenty-six Sundays, and I'll be in every one of them.\n\n> Same moon, same sky, same us.`,
      unlockAt: daysAgo(9),
      firstOpenedAt: daysAgo(8),
    },
    {
      title: "Open me with tea",
      body: "Make a cup of tea first. I'll wait.\n\nReady? Good. Today I just want you to know I'm proud of you.",
      unlockAt: daysAgo(2),
    },
    {
      title: "The one that opens while you watch",
      body: "You watched the countdown hit zero, didn't you? This is what every Sunday morning will feel like.",
      unlockAt: new Date(now.getTime() + 3 * 60_000),
    },
    { title: "Week one apart", body: "Sample locked letter. She cannot read this until it opens.", unlockAt: week1 },
    { title: "Week two apart", body: "Sample locked letter. She cannot read this until it opens.", unlockAt: week2 },
    { title: "Week three apart", body: "Sample locked letter. She cannot read this until it opens.", unlockAt: week3 },
  ]);

  console.log("Seeded 6 letters.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => client.end());
