/**
 * Proves a locked letter cannot be read early. Needs the app running.
 *
 *   npm run check:leaks            (against http://localhost:3000)
 *   BASE_URL=https://... npm run check:leaks
 *
 * It plants a locked letter whose title, body and photo carry marker strings,
 * signs in as the reader, and asserts that no page, RSC payload or photo
 * request ever returns them. The planted rows are removed afterwards.
 */
import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { SignJWT } from "jose";
import postgres from "postgres";
import { letters, photos } from "../src/db/schema";

config({ path: ".env.local" });

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const TITLE_MARKER = "LEAKCHECK-TITLE-7f3a";
const BODY_MARKER = "LEAKCHECK-BODY-91cd";

const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
if (!url || !process.env.SESSION_SECRET) throw new Error("DATABASE_URL and SESSION_SECRET are required");

const client = postgres(url, { prepare: false, max: 1 });
const db = drizzle(client);

let failures = 0;
function check(name: string, ok: boolean, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
  if (!ok) failures++;
}

async function cookieFor(role: "author" | "reader"): Promise<string> {
  const token = await new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(new TextEncoder().encode(process.env.SESSION_SECRET));
  return `session=${token}`;
}

async function fetchAs(cookie: string | null, path: string, rsc = false) {
  const headers: Record<string, string> = {};
  if (cookie) headers.Cookie = cookie;
  if (rsc) headers.RSC = "1";
  // RSC requests are first redirected to a cache-busted URL; follow that hop only.
  const res = await fetch(BASE + path, { headers, redirect: rsc ? "follow" : "manual" });
  return { status: res.status, text: await res.text() };
}

async function main() {
  const [photo] = await db.insert(photos).values({ blobUrl: "local:leakcheck-missing.jpg", contentType: "image/jpeg" }).returning();
  const [locked] = await db
    .insert(letters)
    .values({
      title: TITLE_MARKER,
      body: BODY_MARKER,
      photoId: photo.id,
      unlockAt: new Date(Date.now() + 365 * 86_400_000),
    })
    .returning();

  try {
    const reader = await cookieFor("reader");
    const author = await cookieFor("author");
    const leaks = (text: string) => text.includes(TITLE_MARKER) || text.includes(BODY_MARKER);

    // Sanity: the author can see it, so the markers really are being rendered somewhere.
    const adminList = await fetchAs(author, "/admin");
    check("author sees the planted letter in admin", adminList.status === 200 && adminList.text.includes(TITLE_MARKER));

    for (const rsc of [false, true]) {
      const kind = rsc ? "RSC payload" : "HTML";
      for (const path of ["/", "/letters", "/story"]) {
        const res = await fetchAs(reader, path, rsc);
        check(`reader ${path} ${kind} has no locked content`, res.status === 200 && !leaks(res.text), `status ${res.status}`);
      }
      const direct = await fetchAs(reader, `/letters/${locked.id}`, rsc);
      // The page streams, so "not found" can arrive as the themed page inside a 200.
      const isRefusal = (res: { status: number; text: string }) => res.status === 404 || res.text.includes("Nothing but clouds");
      const refused = isRefusal(direct);
      check(`reader opening the locked letter directly (${kind}) is refused`, refused && !leaks(direct.text), `status ${direct.status}`);

      const adminAsReader = await fetchAs(reader, "/admin", rsc);
      check(`reader cannot load /admin (${kind})`, isRefusal(adminAsReader) && !leaks(adminAsReader.text), `status ${adminAsReader.status}`);
      const editAsReader = await fetchAs(reader, `/admin/letters/${locked.id}`, rsc);
      check(`reader cannot load the edit page (${kind})`, isRefusal(editAsReader) && !leaks(editAsReader.text), `status ${editAsReader.status}`);
    }

    const listing = await fetchAs(reader, "/letters");
    check("letterbox shows the locked envelope without its title", listing.text.includes("A letter for week"));

    const photoAsReader = await fetchAs(reader, `/api/photos/${photo.id}`);
    check("reader cannot fetch the locked letter's photo", photoAsReader.status === 404, `status ${photoAsReader.status}`);

    const photoAnon = await fetchAs(null, `/api/photos/${photo.id}`);
    check("signed-out visitor cannot fetch photos", photoAnon.status === 401, `status ${photoAnon.status}`);

    const anon = await fetchAs(null, "/letters");
    check("signed-out visitor is sent to /login", anon.status >= 300 && anon.status < 400 && !leaks(anon.text), `status ${anon.status}`);
  } finally {
    await db.delete(letters).where(eq(letters.id, locked.id));
    await db.delete(photos).where(eq(photos.id, photo.id));
  }
}

main()
  .catch((error) => {
    console.error(error);
    failures++;
  })
  .finally(async () => {
    await client.end();
    console.log(failures === 0 ? "\nAll checks passed: locked letters stay locked." : `\n${failures} check(s) FAILED.`);
    process.exit(failures === 0 ? 0 : 1);
  });
