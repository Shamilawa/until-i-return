# Until I'm Home

A small private app for two people spending six months apart: a countdown to the reunion, a weekly letter that unlocks every Sunday at 08:00 Sri Lanka time, and (Phase 2) a shared story timeline.

Built with Next.js (App Router), TypeScript, Tailwind CSS, Motion, Drizzle ORM on Postgres (Neon via Vercel), and Vercel Blob for photos.

## What works today (Phase 1)

- Sign-in for exactly two fixed accounts: the **author** (writes letters) and the **reader** (opens them)
- Home: live countdown, flight path with a plane at the % of time apart that has passed, both local times, rotating sweet messages, timer to the next letter
- Letterbox: locked envelopes with a countdown, glowing unread envelopes with an opening animation, reread any time
- Admin (author only, the "Write" tab): write and schedule letters in Markdown with an optional photo, edit dates and sweet messages, two reset buttons

Still to come: the Our Story timeline (Phase 2); night sky, celebration screen, home-screen install, hearts and replies, notifications (Phase 3).

## Run it locally

You need Node 20+ and a Postgres database. With Docker:

```bash
docker run -d --name reunion-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=reunion -p 54329:5432 postgres:17-alpine
```

Then:

```bash
cp .env.example .env.local     # fill it in, see below
npm install
npm run db:migrate             # create the tables
npm run db:seed                # optional sample letters
npm run dev                    # http://localhost:3000
```

### Environment variables

| Name | What it is |
|---|---|
| `DATABASE_URL` | Postgres connection string. Local Docker: `postgres://postgres:postgres@localhost:54329/reunion` |
| `BLOB_READ_WRITE_TOKEN` | Token for a **private** Vercel Blob store. Leave empty locally and photos are saved to `.data/uploads` |
| `SESSION_SECRET` | Long random string that signs the login cookie |
| `AUTHOR_USERNAME`, `AUTHOR_PASSWORD` | Your login |
| `READER_USERNAME`, `READER_PASSWORD` | Her login |

Generate a secret with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.

## The two accounts

There is no sign-up and no users table. The two logins are the four `*_USERNAME` / `*_PASSWORD` variables above. Usernames are not case sensitive; passwords are. To change a password, change the variable (and redeploy on Vercel). To sign everyone out, change `SESSION_SECRET`.

Once signed in, a phone stays signed in for about 200 days.

## Writing letters

1. Sign in as the author and open the **Write** tab.
2. **+ Write**, then add a title, the letter (Markdown: `**bold**`, `*italic*`, `> quote`), and optionally a photo.
3. "Opens at" is pre-filled with the next letter day that has no letter yet, so you can write several weeks in a row. It is always in Sri Lanka time. Change it if you want a surprise on another day.
4. **Seal and schedule**.

The **Letters** tab shows you the letterbox exactly as she sees it. Opening a letter as the author does not mark it as read.

## How letters stay locked

- The browser never talks to the database. All queries live in `src/server/` and are marked `server-only`.
- The reader only ever reads the `reader_letters` view (`drizzle/0001_reader_letters_view.sql`), which returns the title, text and photo as NULL until `unlock_at <= now()` on the **database** clock. Changing the phone's clock does nothing.
- Photos are in private storage and only served through `/api/photos/[id]`, which applies the same rule.
- `npm run check:leaks` (with the app running) plants a locked letter and verifies that no page, data payload or photo URL gives it up.

## Resetting after testing

**Write → Settings → After testing**:

- **Reset her activity** (type `RESET`): every letter looks unopened again. Letters and timeline stay.
- **Wipe everything** (type `WIPE`): deletes all letters, timeline entries and photos, and restores the default dates, schedule and sweet messages.

Neither can be undone.

## Deploying to Vercel

1. Push this folder to a GitHub repository and import it at vercel.com/new.
2. In the Vercel project, open **Storage** and create:
   - a **Postgres (Neon)** database: this adds `DATABASE_URL`
   - a **Blob** store with **private** access: this adds `BLOB_READ_WRITE_TOKEN`
3. In **Settings → Environment Variables** add `SESSION_SECRET`, `AUTHOR_USERNAME`, `AUTHOR_PASSWORD`, `READER_USERNAME`, `READER_PASSWORD`.
4. Deploy (or redeploy if the first build ran before the variables existed). The build runs the database migrations automatically.

Do not run `npm run db:seed` against the production database unless you want the sample letters there; if you do, use **Wipe everything** afterwards.

## Changing names, cities and defaults

`src/lib/config.ts` holds both names, her nickname, the cities and time zones, and the defaults that **Wipe everything** restores. The reunion date, leave date, letter day and sweet messages are edited in the app under Settings.

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Runs migrations, then builds |
| `npm test` | Date and schedule tests |
| `npm run check:leaks` | Locked-letter leak check against a running app (`BASE_URL` to point elsewhere) |
| `npm run db:generate` | Create a migration after editing `src/db/schema.ts` |
| `npm run db:migrate` / `npm run db:seed` | Apply migrations / insert sample data |
