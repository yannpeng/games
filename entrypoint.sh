#!/bin/sh
set -e

# Ensure database directory exists and is writable by any user
DB_DIR=$(dirname "${ARCADE_DB_PATH:-/app/data/arcade_games.db}")
mkdir -p "$DB_DIR"
chmod 777 "$DB_DIR" 2>/dev/null || true

exec "$@"
