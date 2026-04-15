#!/bin/sh
set -e

echo "=== Running DB migrations ==="
npx drizzle-kit migrate 2>&1 || echo "Migration failed or already up to date"

echo "=== Migrating forms to database ==="
npx tsx scripts/migrate-forms.ts 2>&1 || echo "Form migration failed or already done"

echo "=== Seeding admin user ==="
npx tsx scripts/seed-admin.ts 2>&1 || echo "Admin seed failed or already exists"

echo "=== Starting app ==="
exec "$@"
