import { db, schema } from '$lib/server/db';
import { desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const all = db
		.select({
			id: schema.formTemplates.id,
			code: schema.formTemplates.code,
			name: schema.formTemplates.name,
			version: schema.formTemplates.version,
			phase: schema.formTemplates.phase,
			phaseName: schema.formTemplates.phaseName,
			description: schema.formTemplates.description,
			createdAt: schema.formTemplates.createdAt
		})
		.from(schema.formTemplates)
		.orderBy(desc(schema.formTemplates.version))
		.all();

	// Group by code — latest version first (already sorted desc)
	const grouped = new Map<string, typeof all>();
	for (const row of all) {
		if (!grouped.has(row.code)) {
			grouped.set(row.code, []);
		}
		grouped.get(row.code)!.push(row);
	}

	const forms = Array.from(grouped.entries()).map(([code, versions]) => ({
		code,
		name: versions[0].name,
		phase: versions[0].phase,
		phaseName: versions[0].phaseName,
		description: versions[0].description,
		latestId: versions[0].id,
		latestVersion: versions[0].version,
		versions
	}));

	// Sort by code alphabetically
	forms.sort((a, b) => a.code.localeCompare(b.code));

	return { forms };
};
