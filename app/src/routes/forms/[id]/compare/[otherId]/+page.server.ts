import { db, schema } from '$lib/server/db';
import { getFormVersions } from '$lib/server/db/queries';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import type { PageServerLoad } from './$types';

// Same SOURCE_ROOT resolution as migrate-forms.ts
// import.meta.dirname = app/src/routes/forms/[id]/compare/[otherId]
// 7 levels up → repo root (formularios-clinicos/)
const LOCAL_ROOT = resolve(import.meta.dirname, '..', '..', '..', '..', '..', '..', '..');
const DOCKER_SOURCE = '/source';
const SOURCE_ROOT = existsSync(join(DOCKER_SOURCE, 'forms')) ? DOCKER_SOURCE : LOCAL_ROOT;

function readChangelog(code: string): string | null {
	const changelogPath = join(SOURCE_ROOT, 'forms', code, 'CHANGELOG.md');
	if (!existsSync(changelogPath)) return null;
	try {
		return readFileSync(changelogPath, 'utf-8');
	} catch {
		return null;
	}
}

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) {
		throw error(401, 'Debes iniciar sesión');
	}

	const leftId = Number(params.id);
	const rightId = Number(params.otherId);

	const selectFields = {
		id: schema.formTemplates.id,
		code: schema.formTemplates.code,
		name: schema.formTemplates.name,
		version: schema.formTemplates.version,
		versionMajor: schema.formTemplates.versionMajor,
		versionMinor: schema.formTemplates.versionMinor,
		pageConfig: schema.formTemplates.pageConfig,
	};

	const left = db
		.select(selectFields)
		.from(schema.formTemplates)
		.where(eq(schema.formTemplates.id, leftId))
		.get();

	if (!left) throw error(404, 'Formulario no encontrado');

	const right = db
		.select(selectFields)
		.from(schema.formTemplates)
		.where(eq(schema.formTemplates.id, rightId))
		.get();

	if (!right) throw error(404, 'Versión a comparar no encontrada');

	if (left.code !== right.code) {
		throw error(400, 'Solo se pueden comparar versiones del mismo formulario');
	}

	const allVersions = getFormVersions(left.code);
	const changelog = readChangelog(left.code);

	// Determine if right side is the latest version
	const latestId = allVersions[0]?.id ?? left.id;
	const rightIsLatest = right.id === latestId;

	return {
		left,
		right,
		allVersions,
		changelog,
		latestId,
		rightIsLatest,
	};
};
