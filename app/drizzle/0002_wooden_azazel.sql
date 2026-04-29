CREATE TABLE `manual_templates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`form_template_id` integer NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
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
CREATE UNIQUE INDEX `idx_manual_templates_form_version` ON `manual_templates` (`form_template_id`,`version`);--> statement-breakpoint
ALTER TABLE `users` ADD `can_print_manuals` integer DEFAULT false NOT NULL;