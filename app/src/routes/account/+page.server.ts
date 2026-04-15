import { fail, redirect } from '@sveltejs/kit';
import { db, schema } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { hashPassword, verifyPassword } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, '/login');
	}
	return {
		username: locals.user.username,
		displayName: locals.user.displayName,
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Sesión expirada.' });
		}

		const data = await request.formData();
		const currentPassword = (data.get('currentPassword') as string | null) ?? '';
		const newPassword = (data.get('newPassword') as string | null) ?? '';
		const confirmPassword = (data.get('confirmPassword') as string | null) ?? '';

		if (!currentPassword) {
			return fail(400, { error: 'Ingresá tu contraseña actual.' });
		}

		if (newPassword.length < 4) {
			return fail(400, { error: 'La nueva contraseña debe tener al menos 4 caracteres.' });
		}

		if (newPassword !== confirmPassword) {
			return fail(400, { error: 'Las contraseñas no coinciden.' });
		}

		// Verify current password
		const user = db
			.select({ passwordHash: schema.users.passwordHash })
			.from(schema.users)
			.where(eq(schema.users.id, locals.user.id))
			.get();

		if (!user) {
			return fail(400, { error: 'Usuario no encontrado.' });
		}

		const valid = await verifyPassword(currentPassword, user.passwordHash);
		if (!valid) {
			return fail(400, { error: 'La contraseña actual es incorrecta.' });
		}

		// Update password
		const newHash = await hashPassword(newPassword);
		db.update(schema.users)
			.set({ passwordHash: newHash })
			.where(eq(schema.users.id, locals.user.id))
			.run();

		return { success: true };
	},
};
