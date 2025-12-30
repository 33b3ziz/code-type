CREATE TYPE "public"."achievement_type" AS ENUM('speed', 'accuracy', 'consistency', 'special');--> statement-breakpoint
CREATE TYPE "public"."difficulty" AS ENUM('beginner', 'intermediate', 'advanced', 'hardcore');--> statement-breakpoint
CREATE TYPE "public"."language" AS ENUM('javascript', 'typescript', 'python');--> statement-breakpoint
CREATE TYPE "public"."leaderboard_period" AS ENUM('daily', 'weekly', 'alltime');--> statement-breakpoint
CREATE TYPE "public"."snippet_category" AS ENUM('functions', 'loops', 'conditionals', 'classes', 'react-components', 'async', 'data-structures', 'algorithms');--> statement-breakpoint
CREATE TABLE "achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"type" "achievement_type" NOT NULL,
	"icon_url" text,
	"criteria" text NOT NULL,
	"points" integer DEFAULT 10,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "achievements_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "leaderboard_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"period" "leaderboard_period" NOT NULL,
	"language" "language" NOT NULL,
	"difficulty" "difficulty" NOT NULL,
	"best_wpm" real NOT NULL,
	"best_accuracy" real NOT NULL,
	"test_result_id" integer,
	"period_start" timestamp NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "snippets" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"content" text NOT NULL,
	"language" "language" NOT NULL,
	"difficulty" "difficulty" NOT NULL,
	"category" "snippet_category" NOT NULL,
	"character_count" integer NOT NULL,
	"line_count" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"snippet_id" integer NOT NULL,
	"wpm" real NOT NULL,
	"raw_wpm" real NOT NULL,
	"accuracy" real NOT NULL,
	"symbol_accuracy" real,
	"keyword_accuracy" real,
	"characters_typed" integer NOT NULL,
	"correct_characters" integer NOT NULL,
	"incorrect_characters" integer NOT NULL,
	"backspace_count" integer DEFAULT 0,
	"duration" integer NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL,
	"is_strict_mode" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"achievement_id" integer NOT NULL,
	"progress" real DEFAULT 0,
	"unlocked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"theme" varchar(20) DEFAULT 'dark',
	"auto_indent" boolean DEFAULT true,
	"tab_size" integer DEFAULT 2,
	"use_tabs" boolean DEFAULT false,
	"backspace_penalty" boolean DEFAULT false,
	"sound_enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"username" varchar(50) NOT NULL,
	"password_hash" text NOT NULL,
	"display_name" varchar(100),
	"avatar_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "leaderboard_entries" ADD CONSTRAINT "leaderboard_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaderboard_entries" ADD CONSTRAINT "leaderboard_entries_test_result_id_test_results_id_fk" FOREIGN KEY ("test_result_id") REFERENCES "public"."test_results"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_snippet_id_snippets_id_fk" FOREIGN KEY ("snippet_id") REFERENCES "public"."snippets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "leaderboard_period_idx" ON "leaderboard_entries" USING btree ("period");--> statement-breakpoint
CREATE INDEX "leaderboard_language_idx" ON "leaderboard_entries" USING btree ("language");--> statement-breakpoint
CREATE INDEX "leaderboard_ranking_idx" ON "leaderboard_entries" USING btree ("period","language","difficulty","best_wpm");--> statement-breakpoint
CREATE INDEX "snippets_language_idx" ON "snippets" USING btree ("language");--> statement-breakpoint
CREATE INDEX "snippets_difficulty_idx" ON "snippets" USING btree ("difficulty");--> statement-breakpoint
CREATE INDEX "snippets_category_idx" ON "snippets" USING btree ("category");--> statement-breakpoint
CREATE INDEX "snippets_language_difficulty_idx" ON "snippets" USING btree ("language","difficulty");--> statement-breakpoint
CREATE INDEX "test_results_user_idx" ON "test_results" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "test_results_completed_at_idx" ON "test_results" USING btree ("completed_at");--> statement-breakpoint
CREATE INDEX "test_results_user_wpm_idx" ON "test_results" USING btree ("user_id","wpm");--> statement-breakpoint
CREATE INDEX "user_achievements_user_idx" ON "user_achievements" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_achievements_unique" ON "user_achievements" USING btree ("user_id","achievement_id");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_username_idx" ON "users" USING btree ("username");