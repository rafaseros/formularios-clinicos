import { fail, redirect } from '@sveltejs/kit';
import { db, schema } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { verifyPassword, createSession } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.user) {
		redirect(302, '/');
	}
	return { redirectTo: url.searchParams.get('redirect') ?? '/' };
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const username = (data.get('username') as string | null)?.trim() ?? '';
		const password = (data.get('password') as string | null) ?? '';
		const redirectTo = (data.get('redirectTo') as string | null) ?? '/';

		if (!username || !password) {
			return fail(400, { error: 'Usuario y contraseña son requeridos.', username });
		}

		const user = db
			.select()
			.from(schema.users)
			.where(eq(schema.users.username, username))
			.get();

		if (!user) {
			return fail(400, { error: 'Usuario o contraseña incorrectos.', username });
		}

		const valid = await verifyPassword(password, user.passwordHash);
		if (!valid) {
			return fail(400, { error: 'Usuario o contraseña incorrectos.', username });
		}

		const token = createSession(user.id);
		cookies.set('session', token, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7, // 7 days
		});

		redirect(302, redirectTo.startsWith('/') ? redirectTo : '/');
	},
};
