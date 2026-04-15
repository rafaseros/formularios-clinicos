CREATE TABLE `form_instances` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`patient_id` integer NOT NULL,
	`form_template_id` integer NOT NULL,
	`data` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`form_template_id`) REFERENCES `form_templates`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `patients` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`doc_number` text NOT NULL,
	`doc_extension` text DEFAULT '' NOT NULL,
	`first_name` text NOT NULL,
	`paternal_last_name` text NOT NULL,
	`maternal_last_name` text DEFAULT '' NOT NULL,
	`birth_date` text,
	`gender` text,
	`phone` text DEFAULT '' NOT NULL,
	`address` text DEFAULT '' NOT NULL,
	`city` text DEFAULT '' NOT NULL,
	`clinical_record_number` text,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_patients_doc` ON `patients` (`doc_number`,`doc_extension`);