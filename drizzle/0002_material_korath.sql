CREATE TYPE "public"."practice_mode" AS ENUM('symbols', 'keywords', 'weak-spots', 'speed', 'accuracy', 'warm-up');--> statement-breakpoint
CREATE TABLE "practice_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"mode" "practice_mode" NOT NULL,
	"language" "language",
	"difficulty" "difficulty",
	"target_characters" text,
	"duration" integer NOT NULL,
	"characters_typed" integer NOT NULL,
	"correct_characters" integer NOT NULL,
	"accuracy" real NOT NULL,
	"wpm" real NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "practice_sessions" ADD CONSTRAINT "practice_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "practice_sessions_user_idx" ON "practice_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "practice_sessions_mode_idx" ON "practice_sessions" USING btree ("mode");--> statement-breakpoint
CREATE INDEX "practice_sessions_user_mode_idx" ON "practice_sessions" USING btree ("user_id","mode");