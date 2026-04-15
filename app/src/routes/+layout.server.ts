import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

// Public routes — no auth required
const PUBLIC_PATHS = ['/login'];

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const { pathname } = url;

	// Allow public paths and print routes (print is a +server.ts — handled separately, but belt-and-suspenders)
	const isPublic =
		PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/')) ||
		pathname.endsWith('/print');

	if (!locals.user && !isPublic) {
		redirect(302, `/login?redirect=${encodeURIComponent(pathname)}`);
	}

	return { user: locals.user };
};
