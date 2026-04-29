import { db, schema } from '$lib/server/db';
import { getFormVersions, isLatestVersion } from '$lib/server/db/queries';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const formId = Number(params.id);

	const form = db
		.select({
			id: schema.formTemplates.id,
			code: schema.formTemplates.code,
			name: schema.formTemplates.name,
			version: schema.formTemplates.version,
			versionMajor: schema.formTemplates.versionMajor,
			versionMinor: schema.formTemplates.versionMinor,
		})
		.from(schema.formTemplates)
		.where(eq(schema.formTemplates.id, formId))
		.get();

	if (!form) {
		throw error(404, 'Formulario no encontrado');
	}

	const manual = db
		.select({
			id: schema.manualTemplates.id,
			code: schema.manualTemplates.code,
			name: schema.manualTemplates.name,
			version: schema.manualTemplates.version,
			pageConfig: schema.manualTemplates.pageConfig,
			pageCount: schema.manualTemplates.pageCount,
		})
		.from(schema.manualTemplates)
		.where(eq(schema.manualTemplates.formTemplateId, formId))
		.get();

	if (!manual) {
		throw error(404, 'Manual no disponible para este formulario');
	}

	const allVersions = getFormVersions(form.code);
	const isLatest = isLatestVersion(form);

	// Latest form version id — first in sorted list
	const latestId = allVersions[0]?.id ?? form.id;

	return {
		form,
		manual,
		allVersions,
		isLatest,
		latestId,
		user: locals.user,
	};
};
