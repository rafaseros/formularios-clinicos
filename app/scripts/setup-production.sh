#!/bin/bash
# Production setup: run DB migrations and form migration
# Run this ONCE after first deploy or when schema changes
#
# Usage inside Docker container or on VPS with node installed:
#   cd /opt/forms-html/app
#   bash scripts/setup-production.sh

set -e

echo "=== Production Setup ==="

echo "→ Installing dependencies..."
npm ci --production=false

echo "→ Running Drizzle migrations..."
npx drizzle-kit migrate

echo "→ Migrating forms into database..."
npx tsx scripts/migrate-forms.ts

echo "→ Building app..."
npm run build

echo ""
echo "=== Setup complete ==="
echo "Start with: node build"
echo "Or with Docker: docker compose up -d"
