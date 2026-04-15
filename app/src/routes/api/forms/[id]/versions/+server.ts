import { db, schema } from '$lib/server/db';
import { eq, desc } from 'drizzle-orm';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const formId = Number(params.id);

	// Get the base form to find its code
	const baseForm = db
		.select({ code: schema.formTemplates.code })
		.from(schema.formTemplates)
		.where(eq(schema.formTemplates.id, formId))
		.get();

	if (!baseForm) throw error(404, 'Formulario no encontrado');

	const versions = db
		.select({
			id: schema.formTemplates.id,
			code: schema.formTemplates.code,
			name: schema.formTemplates.name,
			version: schema.formTemplates.version,
			createdAt: schema.formTemplates.createdAt
		})
		.from(schema.formTemplates)
		.where(eq(schema.formTemplates.code, baseForm.code))
		.orderBy(desc(schema.formTemplates.version))
		.all();

	return json({ versions });
};

export const POST: RequestHandler = async ({ params }) => {
	const formId = Number(params.id);

	// Get the base form to find its code
	const baseForm = db
		.select({ code: schema.formTemplates.code })
		.from(schema.formTemplates)
		.where(eq(schema.formTemplates.id, formId))
		.get();

	if (!baseForm) throw error(404, 'Formulario no encontrado');

	// Get the latest version for this code
	const latest = db
		.select()
		.from(schema.formTemplates)
		.where(eq(schema.formTemplates.code, baseForm.code))
		.orderBy(desc(schema.formTemplates.version))
		.get();

	if (!latest) throw error(404, 'Formulario no encontrado');

	const now = new Date().toISOString();

	const inserted = db
		.insert(schema.formTemplates)
		.values({
			code: latest.code,
			name: latest.name,
			version: latest.version + 1,
			htmlBody: latest.htmlBody,
			inlineCss: latest.inlineCss,
			commonCss: latest.commonCss,
			logoBase64: latest.logoBase64,
			pageConfig: latest.pageConfig,
			phase: latest.phase,
			phaseName: latest.phaseName,
			description: latest.description,
			pageCount: latest.pageCount,
			createdAt: now,
			updatedAt: now
		})
		.returning({
			id: schema.formTemplates.id,
			code: schema.formTemplates.code,
			name: schema.formTemplates.name,
			version: schema.formTemplates.version,
			createdAt: schema.formTemplates.createdAt
		})
		.get();

	return json({ version: inserted }, { status: 201 });
};
