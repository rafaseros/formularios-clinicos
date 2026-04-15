import { db, schema } from '$lib/server/db';
import { asc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const forms = db
		.select({
			id: schema.formTemplates.id,
			code: schema.formTemplates.code,
			name: schema.formTemplates.name,
			description: schema.formTemplates.description,
			phase: schema.formTemplates.phase,
			phaseName: schema.formTemplates.phaseName,
			pageCount: schema.formTemplates.pageCount,
			pageConfig: schema.formTemplates.pageConfig
		})
		.from(schema.formTemplates)
		.orderBy(asc(schema.formTemplates.phase), asc(schema.formTemplates.code))
		.all();

	// Group by phase
	const phases = new Map<number, { name: string; forms: typeof forms }>();
	for (const form of forms) {
		if (!phases.has(form.phase)) {
			phases.set(form.phase, { name: form.phaseName, forms: [] });
		}
		phases.get(form.phase)!.forms.push(form);
	}

	return {
		phases: Array.from(phases.entries()).map(([num, data]) => ({
			number: num,
			name: data.name,
			forms: data.forms
		}))
	};
};
