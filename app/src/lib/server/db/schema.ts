import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const formTemplates = sqliteTable('form_templates', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull(),
  name: text('name').notNull(),
  // Original version string from the HTML (e.g. "1.0", "1.1"). versionMajor/Minor
  // are split out for ordering — string compare alone breaks at "1.10" vs "1.2".
  version: text('version').notNull().default('1.0'),
  versionMajor: integer('version_major').notNull().default(1),
  versionMinor: integer('version_minor').notNull().default(0),
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
  canPrintManuals: integer('can_print_manuals', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
}, (table) => [
  uniqueIndex('idx_users_username').on(table.username),
]);

export const manualTemplates = sqliteTable('manual_templates', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  formTemplateId: integer('form_template_id').notNull().references(() => formTemplates.id),
  code: text('code').notNull(),
  name: text('name').notNull(),
  version: text('version').notNull().default('1.0'),
  versionMajor: integer('version_major').notNull().default(1),
  versionMinor: integer('version_minor').notNull().default(0),
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
  pageCount: integer('page_count').notNull().default(1),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
}, (table) => [
  uniqueIndex('idx_manual_templates_form_version').on(table.formTemplateId, table.versionMajor, table.versionMinor),
]);

export const formComments = sqliteTable('form_comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  formTemplateId: integer('form_template_id').notNull().references(() => formTemplates.id),
  userId: integer('user_id').notNull().references(() => users.id),
  // Null for root comments; set to the parent's id for replies. Depth is
  // limited to one level — replies cannot themselves have replies.
  parentCommentId: integer('parent_comment_id').references((): any => formComments.id),
  content: text('content').notNull(),
  status: text('status', { enum: ['open', 'resolved'] }).notNull().default('open'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});
