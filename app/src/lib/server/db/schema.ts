import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const formTemplates = sqliteTable('form_templates', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull(),
  name: text('name').notNull(),
  version: integer('version').notNull().default(1),
  htmlBody: text('html_body').notNull(),
  inlineCss: text('inline_css').notNull().default(''),
  commonCss: text('common_css').notNull(),
  logoBase64: text('logo_base64').notNull(),
  pageConfig: text('page_config', { mode: 'json' }).notNull().$type<{
    orientation: 'portrait' | 'landscape';
    size: string;
    margins: {
      top: string;
      right: string;
      bottom: string;
      left: string;
    };
  }>(),
  phase: integer('phase').notNull().default(1),
  phaseName: text('phase_name').notNull().default(''),
  description: text('description').notNull().default(''),
  pageCount: integer('page_count').notNull().default(1),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});
