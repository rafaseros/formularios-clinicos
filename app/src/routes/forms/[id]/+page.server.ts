import { db, schema } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
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

	const comments = db
		.select({
			id: schema.formComments.id,
			content: schema.formComments.content,
			status: schema.formComments.status,
			createdAt: schema.formComments.createdAt,
			userId: schema.formComments.userId,
			displayName: schema.users.displayName,
			username: schema.users.username,
		})
		.from(schema.formComments)
		.leftJoin(schema.users, eq(schema.formComments.userId, schema.users.id))
		.where(eq(schema.formComments.formTemplateId, Number(params.id)))
		.all();

	return {
		form,
		comments,
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

		if (!content) {
			return fail(400, { commentError: 'El comentario no puede estar vacío.' });
		}

		db.insert(schema.formComments)
			.values({
				formTemplateId: Number(params.id),
				userId: locals.user.id,
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

		db.update(schema.formComments)
			.set({ status: 'resolved' })
			.where(eq(schema.formComments.id, commentId))
			.run();

		return { success: true };
	},
};
