CREATE TABLE `form_templates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
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
