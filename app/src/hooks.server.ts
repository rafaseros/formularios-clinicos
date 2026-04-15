import { getUserFromSession } from '$lib/server/auth';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('session');
	const user = getUserFromSession(token);
	event.locals.user = user;
	return resolve(event);
};
