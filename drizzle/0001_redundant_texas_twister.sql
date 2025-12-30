ALTER TABLE "user_settings" ALTER COLUMN "sound_enabled" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "sound_volume" integer DEFAULT 50;--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "show_line_numbers" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "smooth_caret" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "caret_style" varchar(20) DEFAULT 'line';--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "font_size" integer DEFAULT 16;--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "strict_mode" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "show_wpm" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "show_accuracy" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "show_timer" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "user_settings" DROP COLUMN "use_tabs";--> statement-breakpoint
ALTER TABLE "user_settings" DROP COLUMN "backspace_penalty";