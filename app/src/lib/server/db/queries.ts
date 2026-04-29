/**
 * Versioning query helpers for form_templates.
 *
 * SQLite window functions (ROW_NUMBER OVER PARTITION) require running a raw
 * SQL query because Drizzle's query builder (as of 0.45.x) doesn't expose a
 * first-class window-function API for SQLite. We use `db.get/all(sql\`...\`)`
 * and return typed results that match the columns we need in each route.
 */

import { db, schema } from '.';
import { sql, eq, asc, desc } from 'drizzle-orm';

// ─── Types ───────────────────────────────────────────────────────────────────

export type FormVersionRow = {
	id: number;
	code: string;
	name: string;
	version: string;
	versionMajor: number;
	versionMinor: number;
	description: string;
	phase: number;
	phaseName: string;
	pageCount: number;
	pageConfig: {
		orientation: 'portrait' | 'landscape';
		size: string;
		margins: { top: string; right: string; bottom: string; left: string };
	};
};

export type FormVersionSummary = {
	id: number;
	code: string;
	version: string;
	versionMajor: number;
	versionMinor: number;
};

// ─── Latest version per code ─────────────────────────────────────────────────

/**
 * Returns one row per unique `code`, the one with the highest
 * (versionMajor, versionMinor). Uses a correlated subquery compatible
 * with SQLite (no window-function syntax needed for this shape).
 */
export function getLatestFormPerCode(): FormVersionRow[] {
	// Drizzle's .all() on a raw sql tag returns unknown[]; we cast safely.
	const rows = db.all(sql`
		SELECT
			ft.id,
			ft.code,
			ft.name,
			ft.version,
			ft.version_major   AS versionMajor,
			ft.version_minor   AS versionMinor,
			ft.description,
			ft.phase,
			ft.phase_name      AS phaseName,
			ft.page_count      AS pageCount,
			ft.page_config     AS pageConfig
		FROM form_templates ft
		INNER JOIN (
			SELECT
				code,
				MAX(version_major * 1000 + version_minor) AS max_rank
			FROM form_templates
			GROUP BY code
		) latest
		ON ft.code = latest.code
		AND (ft.version_major * 1000 + ft.version_minor) = latest.max_rank
		ORDER BY ft.phase ASC, ft.code ASC
	`) as Array<Omit<FormVersionRow, 'pageConfig'> & { pageConfig: string | object }>;

	// page_config is stored as JSON text; better-sqlite3 returns it as a string.
	return rows.map((r) => ({
		...r,
		pageConfig: typeof r.pageConfig === 'string' ? JSON.parse(r.pageConfig) : r.pageConfig,
	})) as FormVersionRow[];
}

// ─── All versions for a code ─────────────────────────────────────────────────

/**
 * Returns all rows for a given `code`, sorted newest first.
 */
export function getFormVersions(code: string): FormVersionSummary[] {
	return db
		.select({
			id: schema.formTemplates.id,
			code: schema.formTemplates.code,
			version: schema.formTemplates.version,
			versionMajor: schema.formTemplates.versionMajor,
			versionMinor: schema.formTemplates.versionMinor,
		})
		.from(schema.formTemplates)
		.where(eq(schema.formTemplates.code, code))
		.orderBy(
			desc(schema.formTemplates.versionMajor),
			desc(schema.formTemplates.versionMinor)
		)
		.all();
}

// ─── Is this the latest version? ─────────────────────────────────────────────

/**
 * Returns true when no other row for the same `code` has a higher
 * (versionMajor, versionMinor) pair.
 */
export function isLatestVersion(form: {
	code: string;
	versionMajor: number;
	versionMinor: number;
}): boolean {
	const newer = db.get(sql`
		SELECT id
		FROM form_templates
		WHERE code = ${form.code}
		  AND (version_major * 1000 + version_minor) > ${form.versionMajor * 1000 + form.versionMinor}
		LIMIT 1
	`) as { id: number } | undefined;

	return newer == null;
}
