import { db, schema } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import { asc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

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
			createdAt: schema.users.createdAt,
		})
		.from(schema.users)
		.orderBy(asc(schema.users.username))
		.all();

	return { users };
};
