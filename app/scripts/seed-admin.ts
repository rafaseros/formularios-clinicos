/**
 * Creates a default admin user: admin / admin123
 * Run with: npx tsx scripts/seed-admin.ts
 */
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import { resolve } from 'path';
import bcrypt from 'bcryptjs';
import * as schema from '../src/lib/server/db/schema.js';

const dbPath = resolve(process.cwd(), 'data', 'forms.db');
const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

const db = drizzle(sqlite, { schema });

const USERNAME = 'admin';
const PASSWORD = 'admin123';
const DISPLAY_NAME = 'Administrador';

async function main() {
	const existing = db
		.select({ id: schema.users.id })
		.from(schema.users)
		.where(eq(schema.users.username, USERNAME))
		.get();

	if (existing) {
		console.log(`Usuario '${USERNAME}' ya existe (id=${existing.id}). Sin cambios.`);
		sqlite.close();
		return;
	}

	const passwordHash = await bcrypt.hash(PASSWORD, 10);

	const result = db
		.insert(schema.users)
		.values({
			username: USERNAME,
			passwordHash,
			displayName: DISPLAY_NAME,
			role: 'admin',
		})
		.returning({ id: schema.users.id })
		.get();

	console.log(`Usuario admin creado con id=${result.id}`);
	console.log(`  Usuario:    ${USERNAME}`);
	console.log(`  Contraseña: ${PASSWORD}`);
	sqlite.close();
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
