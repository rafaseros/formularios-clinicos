#!/bin/bash
# Deploy script for Forms HTML app
# Usage: ./scripts/deploy.sh [user@host]
#
# Prerequisites on VPS:
#   - Docker + Docker Compose installed
#   - Git installed

set -e

HOST=${1:-""}
REMOTE_DIR="/opt/forms-html"

if [ -z "$HOST" ]; then
  echo "Usage: ./scripts/deploy.sh user@host"
  echo "Example: ./scripts/deploy.sh root@192.168.1.100"
  exit 1
fi

echo "=== Deploying to $HOST ==="

# Sync code to VPS
echo "→ Syncing files..."
rsync -avz --exclude='node_modules' --exclude='.svelte-kit' --exclude='build' \
  --exclude='data' --exclude='*.db*' --exclude='.env' \
  -e ssh . "$HOST:$REMOTE_DIR/app/"

# Also sync migration source files (forms/, css/, logo.png)
rsync -avz -e ssh ../forms/ "$HOST:$REMOTE_DIR/forms/"
rsync -avz -e ssh ../css/ "$HOST:$REMOTE_DIR/css/"
rsync -avz -e ssh ../logo.png "$HOST:$REMOTE_DIR/logo.png"

# Build and restart on VPS
echo "→ Building on VPS..."
ssh "$HOST" "cd $REMOTE_DIR/app && docker compose up -d --build"

echo "→ Running migrations..."
ssh "$HOST" "cd $REMOTE_DIR/app && docker compose exec app node -e \"
  const Database = require('better-sqlite3');
  const db = new Database('/app/data/forms.db');
  db.pragma('journal_mode = WAL');
  console.log('DB ready');
  db.close();
\""

echo ""
echo "=== Deploy complete ==="
echo "App running at: http://$HOST:3000"
