import { db, schema } from '$lib/server/db';
import { error, fail } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';
import { hashPassword } from '$lib/server/auth';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || locals.user.role !== 'admin') {
		throw error(403, 'Solo administradores pueden ver la lista de usuarios.');
	}

	const users = db
		.select({
			id: schema.users.id,
			username: schema.users.username,
			displayName: schema.users.displayName,
			role: schema.users.role,
			canPrint: schema.users.canPrint,
			createdAt: schema.users.createdAt,
		})
		.from(schema.users)
		.orderBy(asc(schema.users.username))
		.all();

	return { users };
};

export const actions: Actions = {
	updateName: async ({ request, locals }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'No tenés permisos.' });
		}

		const data = await request.formData();
		const userId = Number(data.get('userId'));
		const displayName = (data.get('displayName') as string | null)?.trim() ?? '';

		if (!displayName) {
			return fail(400, { error: 'El nombre no puede estar vacío.', userId });
		}

		db.update(schema.users)
			.set({ displayName })
			.where(eq(schema.users.id, userId))
			.run();

		return { success: true, message: 'Nombre actualizado.' };
	},

	resetPassword: async ({ request, locals }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'No tenés permisos.' });
		}

		const data = await request.formData();
		const userId = Number(data.get('userId'));

		const user = db
			.select({ username: schema.users.username })
			.from(schema.users)
			.where(eq(schema.users.id, userId))
			.get();

		if (!user) {
			return fail(404, { error: 'Usuario no encontrado.' });
		}

		const newHash = await hashPassword(user.username);
		db.update(schema.users)
			.set({ passwordHash: newHash })
			.where(eq(schema.users.id, userId))
			.run();

		return { success: true, message: `Contraseña reseteada a "${user.username}".` };
	},

	togglePrint: async ({ request, locals }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'No tenés permisos.' });
		}

		const data = await request.formData();
		const userId = Number(data.get('userId'));

		const target = db
			.select({ canPrint: schema.users.canPrint })
			.from(schema.users)
			.where(eq(schema.users.id, userId))
			.get();

		if (!target) {
			return fail(404, { error: 'Usuario no encontrado.' });
		}

		db.update(schema.users)
			.set({ canPrint: !target.canPrint })
			.where(eq(schema.users.id, userId))
			.run();

		const next = !target.canPrint;
		return {
			success: true,
			message: next ? 'Permiso de impresión habilitado.' : 'Permiso de impresión deshabilitado.',
		};
	},
};
