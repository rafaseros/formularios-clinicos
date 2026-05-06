import { db, schema } from '$lib/server/db';
import { getFormVersions, isLatestVersion } from '$lib/server/db/queries';
import { and, asc, eq, isNull } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

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
			pageConfig: schema.formTemplates.pageConfig,
			phase: schema.formTemplates.phase,
			phaseName: schema.formTemplates.phaseName,
			description: schema.formTemplates.description,
			pageCount: schema.formTemplates.pageCount
		})
		.from(schema.formTemplates)
		.where(eq(schema.formTemplates.id, formId))
		.get();

	if (!form) {
		throw error(404, 'Formulario no encontrado');
	}

	const allVersions = getFormVersions(form.code);
	const isLatest = isLatestVersion(form);

	// The latest version id (first in the sorted list)
	const latestId = allVersions[0]?.id ?? form.id;

	const allComments = db
		.select({
			id: schema.formComments.id,
			content: schema.formComments.content,
			status: schema.formComments.status,
			createdAt: schema.formComments.createdAt,
			userId: schema.formComments.userId,
			parentCommentId: schema.formComments.parentCommentId,
			displayName: schema.users.displayName,
			username: schema.users.username,
		})
		.from(schema.formComments)
		.leftJoin(schema.users, eq(schema.formComments.userId, schema.users.id))
		.where(eq(schema.formComments.formTemplateId, formId))
		.orderBy(asc(schema.formComments.createdAt))
		.all();

	const repliesByParent = new Map<number, typeof allComments>();
	for (const c of allComments) {
		if (c.parentCommentId == null) continue;
		const list = repliesByParent.get(c.parentCommentId) ?? [];
		list.push(c);
		repliesByParent.set(c.parentCommentId, list);
	}

	const comments = allComments
		.filter((c) => c.parentCommentId == null)
		.map((root) => ({
			...root,
			replies: repliesByParent.get(root.id) ?? [],
		}));

	// Default comparison target:
	// - If current is the latest → compare against previous (index 1)
	// - If current is historical → compare against the latest (index 0)
	// allVersions is sorted newest-first, so index 0 = latest, index 1 = previous.
	const compareDefaultId: number | null =
		allVersions.length > 1
			? isLatest
				? (allVersions[1]?.id ?? null)
				: (allVersions[0]?.id ?? null)
			: null;

	return {
		form,
		comments,
		allVersions,
		isLatest,
		latestId,
		compareDefaultId,
		user: locals.user,
	};
};

export const actions: Actions = {
	addComment: async ({ request, params, locals }) => {
		if (!locals.user) {
			return fail(401, { commentError: 'Debes iniciar sesión para comentar.' });
		}

		const data = await request.formData();
		const content = (data.get('content') as string | null)?.trim() ?? '';
		const parentRaw = data.get('parentCommentId') as string | null;
		const parentCommentId = parentRaw && parentRaw.trim() !== '' ? Number(parentRaw) : null;

		if (!content) {
			return fail(400, {
				commentError: 'El comentario no puede estar vacío.',
				parentCommentId,
			});
		}

		const formId = Number(params.id);

		// Replies: validate the parent exists, belongs to this form, and is itself
		// a root comment (1-level depth — no replies to replies).
		if (parentCommentId !== null) {
			const parent = db
				.select({
					id: schema.formComments.id,
					formTemplateId: schema.formComments.formTemplateId,
					parentCommentId: schema.formComments.parentCommentId,
				})
				.from(schema.formComments)
				.where(eq(schema.formComments.id, parentCommentId))
				.get();

			if (!parent || parent.formTemplateId !== formId) {
				return fail(400, { commentError: 'Comentario padre inválido.', parentCommentId });
			}
			if (parent.parentCommentId !== null) {
				return fail(400, {
					commentError: 'No se puede responder a una respuesta. Respondé al comentario original.',
					parentCommentId,
				});
			}
		}

		db.insert(schema.formComments)
			.values({
				formTemplateId: formId,
				userId: locals.user.id,
				parentCommentId,
				content,
				status: 'open',
			})
			.run();

		return { success: true };
	},

	resolveComment: async ({ request, locals }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { commentError: 'Solo los administradores pueden resolver comentarios.' });
		}

		const data = await request.formData();
		const commentId = Number(data.get('commentId'));

		if (!commentId) {
			return fail(400, { commentError: 'ID de comentario inválido.' });
		}

		// Only root comments carry a status — replies are aclaraciones, not
		// independent observations.
		db.update(schema.formComments)
			.set({ status: 'resolved' })
			.where(and(eq(schema.formComments.id, commentId), isNull(schema.formComments.parentCommentId)))
			.run();

		return { success: true };
	},
};
