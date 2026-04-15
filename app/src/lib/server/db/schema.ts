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

export const patients = sqliteTable('patients', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  docNumber: text('doc_number').notNull(),
  docExtension: text('doc_extension').notNull().default(''),
  firstName: text('first_name').notNull(),
  paternalLastName: text('paternal_last_name').notNull(),
  maternalLastName: text('maternal_last_name').notNull().default(''),
  birthDate: text('birth_date'),
  gender: text('gender', { enum: ['M', 'F'] }),
  phone: text('phone').notNull().default(''),
  address: text('address').notNull().default(''),
  city: text('city').notNull().default(''),
  clinicalRecordNumber: text('clinical_record_number'),
  status: text('status', { enum: ['active', 'discharged', 'transferred'] }).notNull().default('active'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
}, (table) => [
  uniqueIndex('idx_patients_doc').on(table.docNumber, table.docExtension),
]);

export const formInstances = sqliteTable('form_instances', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  patientId: integer('patient_id').notNull().references(() => patients.id),
  formTemplateId: integer('form_template_id').notNull().references(() => formTemplates.id),
  data: text('data', { mode: 'json' }).$type<Record<string, unknown>>(),
  status: text('status', { enum: ['draft', 'completed', 'archived'] }).notNull().default('draft'),
  notes: text('notes').notNull().default(''),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});
