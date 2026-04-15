import bcrypt from 'bcryptjs';
import { db, schema } from '$lib/server/db';
import { eq } from 'drizzle-orm';

export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	return bcrypt.compare(password, hash);
}

export function createSession(userId: number): string {
	return Buffer.from(JSON.stringify({ userId, ts: Date.now() })).toString('base64');
}

export function parseSession(token: string): { userId: number } | null {
	try {
		const data = JSON.parse(Buffer.from(token, 'base64').toString());
		return { userId: data.userId };
	} catch {
		return null;
	}
}

export function getUserFromSession(token: string | undefined) {
	if (!token) return null;
	const session = parseSession(token);
	if (!session) return null;
	return (
		db
			.select({
				id: schema.users.id,
				username: schema.users.username,
				displayName: schema.users.displayName,
				role: schema.users.role,
			})
			.from(schema.users)
			.where(eq(schema.users.id, session.userId))
			.get() ?? null
	);
}
