CREATE TABLE "letters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"photo_id" uuid,
	"unlock_at" timestamp with time zone NOT NULL,
	"first_opened_at" timestamp with time zone,
	"reaction" text,
	"reply_note" text,
	"replied_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"blob_url" text NOT NULL,
	"content_type" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"met_on" date NOT NULL,
	"leave_at" timestamp with time zone NOT NULL,
	"reunion_at" timestamp with time zone NOT NULL,
	"letter_weekday" integer NOT NULL,
	"letter_time" text NOT NULL,
	"timezone" text NOT NULL,
	"sweet_messages" text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "timeline_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"happened_on" date NOT NULL,
	"title" text NOT NULL,
	"caption" text,
	"location" text,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "timeline_photos" (
	"entry_id" uuid NOT NULL,
	"photo_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "timeline_photos_entry_id_photo_id_pk" PRIMARY KEY("entry_id","photo_id")
);
--> statement-breakpoint
ALTER TABLE "letters" ADD CONSTRAINT "letters_photo_id_photos_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."photos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timeline_photos" ADD CONSTRAINT "timeline_photos_entry_id_timeline_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."timeline_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timeline_photos" ADD CONSTRAINT "timeline_photos_photo_id_photos_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."photos"("id") ON DELETE cascade ON UPDATE no action;