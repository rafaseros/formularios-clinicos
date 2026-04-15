CREATE TABLE `form_comments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`form_template_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`content` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`form_template_id`) REFERENCES `form_templates`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`display_name` text DEFAULT '' NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_users_username` ON `users` (`username`);