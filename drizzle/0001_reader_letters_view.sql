-- The only thing reader-facing code reads. Title, body and photo stay NULL
-- until unlock_at has passed on the database clock, so a locked letter's
-- content never leaves Postgres.
CREATE VIEW "reader_letters" AS
SELECT
  l.id,
  l.unlock_at,
  (l.unlock_at <= now()) AS is_unlocked,
  GREATEST(
    1,
    CEIL(EXTRACT(EPOCH FROM (l.unlock_at - COALESCE(s.leave_at, l.unlock_at))) / 604800.0)
  )::int AS week_number,
  CASE WHEN l.unlock_at <= now() THEN l.title END AS title,
  CASE WHEN l.unlock_at <= now() THEN l.body END AS body,
  CASE WHEN l.unlock_at <= now() THEN l.photo_id END AS photo_id,
  l.first_opened_at,
  l.reaction,
  l.reply_note
FROM letters l
LEFT JOIN settings s ON s.id = 1;
