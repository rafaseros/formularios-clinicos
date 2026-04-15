import { fail, redirect, error } from '@sveltejs/kit';
import { db, schema } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { hashPassword } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || locals.user.role !== 'admin') {
		throw error(403, 'Solo administradores pueden registrar usuarios.');
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'No tenés permisos para registrar usuarios.', username: '', displayName: '' });
		}

		const data = await request.formData();
		const username = (data.get('username') as string | null)?.trim() ?? '';
		const password = (data.get('password') as string | null) ?? '';
		const displayName = (data.get('displayName') as string | null)?.trim() ?? '';

		if (!username) {
			return fail(400, { error: 'El nombre de usuario es requerido.', username, displayName });
		}
		if (password.length < 4) {
			return fail(400, {
				error: 'La contraseña debe tener al menos 4 caracteres.',
				username,
				displayName,
			});
		}

		const existing = db
			.select({ id: schema.users.id })
			.from(schema.users)
			.where(eq(schema.users.username, username))
			.get();

		if (existing) {
			return fail(400, {
				error: 'Ese nombre de usuario ya está en uso.',
				username,
				displayName,
			});
		}

		const passwordHash = await hashPassword(password);

		db.insert(schema.users)
			.values({
				username,
				passwordHash,
				displayName: displayName || username,
				role: 'user',
			})
			.run();

		redirect(302, '/users');
	},
};
