CREATE TYPE "public"."race_status" AS ENUM('waiting', 'countdown', 'racing', 'finished');--> statement-breakpoint
CREATE TABLE "race_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"race_id" integer NOT NULL,
	"user_id" uuid NOT NULL,
	"progress" real DEFAULT 0 NOT NULL,
	"wpm" real DEFAULT 0 NOT NULL,
	"accuracy" real DEFAULT 100 NOT NULL,
	"is_ready" boolean DEFAULT false NOT NULL,
	"is_finished" boolean DEFAULT false NOT NULL,
	"finish_time" integer,
	"position" integer,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "races" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(6) NOT NULL,
	"host_id" uuid NOT NULL,
	"snippet_id" integer,
	"status" "race_status" DEFAULT 'waiting' NOT NULL,
	"max_players" integer DEFAULT 4 NOT NULL,
	"countdown_duration" integer DEFAULT 3 NOT NULL,
	"language" "language",
	"difficulty" "difficulty",
	"is_private" boolean DEFAULT false NOT NULL,
	"started_at" timestamp,
	"finished_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "races_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "race_participants" ADD CONSTRAINT "race_participants_race_id_races_id_fk" FOREIGN KEY ("race_id") REFERENCES "public"."races"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "race_participants" ADD CONSTRAINT "race_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "races" ADD CONSTRAINT "races_host_id_users_id_fk" FOREIGN KEY ("host_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "races" ADD CONSTRAINT "races_snippet_id_snippets_id_fk" FOREIGN KEY ("snippet_id") REFERENCES "public"."snippets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "race_participants_race_idx" ON "race_participants" USING btree ("race_id");--> statement-breakpoint
CREATE INDEX "race_participants_user_idx" ON "race_participants" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "race_participants_race_user_idx" ON "race_participants" USING btree ("race_id","user_id");--> statement-breakpoint
CREATE INDEX "races_code_idx" ON "races" USING btree ("code");--> statement-breakpoint
CREATE INDEX "races_host_idx" ON "races" USING btree ("host_id");--> statement-breakpoint
CREATE INDEX "races_status_idx" ON "races" USING btree ("status");--> statement-breakpoint
CREATE INDEX "races_created_at_idx" ON "races" USING btree ("created_at");