#!/bin/sh
set -e

# Ensure database directory exists and set ownership to appuser (UID 1000)
DB_DIR=$(dirname "${ARCADE_DB_PATH:-/app/data/arcade_games.db}")
mkdir -p "$DB_DIR"
chown -R appuser:appuser "$DB_DIR"
chmod 755 "$DB_DIR"

# If container is running as root, drop privileges and execute as appuser
if [ "$(id -u)" = '0' ]; then
    exec gosu appuser "$@"
fi

exec "$@"
