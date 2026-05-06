-- Remove stale v1.0 rows for codes F001–F005. The flat-to-subdir migration
-- in commit 9bf65bd assigned v1.0 filenames to source HTMLs that internally
-- said v1.1. Files were renamed to v1.1.html in the same commit as this
-- migration; this DELETE removes the orphaned v1.0 rows that the migrate
-- scripts had populated before the rename. Forms were not yet in clinical
-- use, so deleting v1.0 rows is safe.
PRAGMA foreign_keys=OFF;--> statement-breakpoint
DELETE FROM `manual_templates`
WHERE `form_template_id` IN (
  SELECT `id` FROM `form_templates`
  WHERE `code` IN ('PGB-F001','PGB-F002','PGB-F003','PGB-F004','PGB-F005')
    AND `version` = '1.0'
);--> statement-breakpoint
DELETE FROM `form_templates`
WHERE `code` IN ('PGB-F001','PGB-F002','PGB-F003','PGB-F004','PGB-F005')
  AND `version` = '1.0';--> statement-breakpoint
PRAGMA foreign_keys=ON;
