import { boolean, date, integer, pgTable, pgView, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

const timestamptz = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });

/** Single row (id = 1). */
export const settings = pgTable("settings", {
  id: integer("id").primaryKey().default(1),
  metOn: date("met_on").notNull(),
  leaveAt: timestamptz("leave_at").notNull(),
  reunionAt: timestamptz("reunion_at").notNull(),
  letterWeekday: integer("letter_weekday").notNull(),
  letterTime: text("letter_time").notNull(),
  timezone: text("timezone").notNull(),
  sweetMessages: text("sweet_messages").array().notNull(),
});

export const photos = pgTable("photos", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Never sent to the browser; images are streamed through /api/photos/[id].
  blobUrl: text("blob_url").notNull(),
  contentType: text("content_type").notNull(),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
});

export const letters = pgTable("letters", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  photoId: uuid("photo_id").references(() => photos.id, { onDelete: "set null" }),
  unlockAt: timestamptz("unlock_at").notNull(),
  firstOpenedAt: timestamptz("first_opened_at"),
  reaction: text("reaction"),
  replyNote: text("reply_note"),
  repliedAt: timestamptz("replied_at"),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  updatedAt: timestamptz("updated_at").notNull().defaultNow(),
});

export const timelineEntries = pgTable("timeline_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  happenedOn: date("happened_on").notNull(),
  title: text("title").notNull(),
  caption: text("caption"),
  location: text("location"),
  createdBy: text("created_by", { enum: ["author", "reader"] }).notNull(),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
});

export const timelinePhotos = pgTable(
  "timeline_photos",
  {
    entryId: uuid("entry_id")
      .notNull()
      .references(() => timelineEntries.id, { onDelete: "cascade" }),
    photoId: uuid("photo_id")
      .notNull()
      .references(() => photos.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.entryId, t.photoId] })],
);

/**
 * What the reader is allowed to see. Title, body and photo are NULL until
 * unlock_at has passed on the database clock. Defined in drizzle/0001_reader_letters_view.sql.
 */
export const readerLetters = pgView("reader_letters", {
  id: uuid("id").notNull(),
  unlockAt: timestamptz("unlock_at").notNull(),
  isUnlocked: boolean("is_unlocked").notNull(),
  weekNumber: integer("week_number").notNull(),
  title: text("title"),
  body: text("body"),
  photoId: uuid("photo_id"),
  firstOpenedAt: timestamptz("first_opened_at"),
  reaction: text("reaction"),
  replyNote: text("reply_note"),
}).existing();
