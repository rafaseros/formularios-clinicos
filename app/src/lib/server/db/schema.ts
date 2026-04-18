import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';

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

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull(),
  passwordHash: text('password_hash').notNull(),
  displayName: text('display_name').notNull().default(''),
  role: text('role', { enum: ['user', 'admin'] }).notNull().default('user'),
  canPrint: integer('can_print', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
}, (table) => [
  uniqueIndex('idx_users_username').on(table.username),
]);

export const formComments = sqliteTable('form_comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  formTemplateId: integer('form_template_id').notNull().references(() => formTemplates.id),
  userId: integer('user_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  status: text('status', { enum: ['open', 'resolved'] }).notNull().default('open'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});
