import { fail, redirect } from '@sveltejs/kit';
import { db, schema } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { hashPassword, createSession } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		redirect(302, '/');
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const username = (data.get('username') as string | null)?.trim() ?? '';
		const password = (data.get('password') as string | null) ?? '';
		const displayName = (data.get('displayName') as string | null)?.trim() ?? '';

		// Validation
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

		// Check uniqueness
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

		const result = db
			.insert(schema.users)
			.values({
				username,
				passwordHash,
				displayName: displayName || username,
				role: 'user',
			})
			.returning({ id: schema.users.id })
			.get();

		const token = createSession(result.id);
		cookies.set('session', token, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7,
		});

		redirect(302, '/');
	},
};
