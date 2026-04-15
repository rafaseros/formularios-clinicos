import { db, schema } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const form = db
		.select({
			id: schema.formTemplates.id,
			code: schema.formTemplates.code,
			name: schema.formTemplates.name,
			version: schema.formTemplates.version,
			pageConfig: schema.formTemplates.pageConfig,
			phase: schema.formTemplates.phase,
			phaseName: schema.formTemplates.phaseName,
			description: schema.formTemplates.description,
			pageCount: schema.formTemplates.pageCount
		})
		.from(schema.formTemplates)
		.where(eq(schema.formTemplates.id, Number(params.id)))
		.get();

	if (!form) {
		throw error(404, 'Formulario no encontrado');
	}

	return { form };
};
