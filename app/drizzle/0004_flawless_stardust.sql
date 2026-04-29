-- Versioning migration: convert `version` from integer to (text + major + minor).
-- The schema change requires a SQLite table rebuild. Both tables are repopulated
-- from the HTML source files (forms/ and manuals/) by the migrate scripts that
-- run right after, so we drop and recreate without preserving rows.
PRAGMA foreign_keys=OFF;--> statement-breakpoint
DELETE FROM `form_comments`;--> statement-breakpoint
DROP TABLE `manual_templates`;--> statement-breakpoint
DROP TABLE `form_templates`;--> statement-breakpoint
CREATE TABLE `form_templates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`version` text DEFAULT '1.0' NOT NULL,
	`version_major` integer DEFAULT 1 NOT NULL,
	`version_minor` integer DEFAULT 0 NOT NULL,
	`html_body` text NOT NULL,
	`inline_css` text DEFAULT '' NOT NULL,
	`common_css` text NOT NULL,
	`logo_base64` text NOT NULL,
	`page_config` text NOT NULL,
	`phase` integer DEFAULT 1 NOT NULL,
	`phase_name` text DEFAULT '' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`page_count` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `manual_templates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`form_template_id` integer NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`version` text DEFAULT '1.0' NOT NULL,
	`version_major` integer DEFAULT 1 NOT NULL,
	`version_minor` integer DEFAULT 0 NOT NULL,
	`html_body` text NOT NULL,
	`inline_css` text DEFAULT '' NOT NULL,
	`common_css` text NOT NULL,
	`logo_base64` text NOT NULL,
	`page_config` text NOT NULL,
	`page_count` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`form_template_id`) REFERENCES `form_templates`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_manual_templates_form_version` ON `manual_templates` (`form_template_id`,`version_major`,`version_minor`);--> statement-breakpoint
PRAGMA foreign_keys=ON;
