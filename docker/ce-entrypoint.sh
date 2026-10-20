#!/bin/bash
set -e

# Start Redis if not already running (bundled sidecar for single-instance CE)
if ! pgrep -x redis-server > /dev/null 2>&1; then
  redis-server /app/redis.conf
  echo "Redis started"
fi

if [ -f "./.env" ]; then
  export $(grep -v '^#' ./.env | xargs -d '\n') || true
fi

if [ -d "./server/dist" ]; then
  SETUP_CMD='npm run db:setup:prod'
else
  SETUP_CMD='npm run db:setup'
fi

if [ -f "./.env" ]; then
  declare $(grep -v '^#' ./.env | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
  # PG_HOST may be a unix socket directory (e.g. Cloud SQL on Cloud Run), which wait-for-it.sh cannot probe
  ./server/scripts/wait-for-postgres.sh "$PG_HOST" "${PG_PORT:-5432}" -- $SETUP_CMD
else
  PG_HOST=$(echo "$DATABASE_URL" | awk -F'[/:@?]' '{print $6}')
  PG_PORT=$(echo "$DATABASE_URL" | awk -F'[/:@?]' '{print $7}')

  if [ -z "$DATABASE_PORT" ]; then
    DATABASE_PORT="5432"
  fi

  ./server/scripts/wait-for-it.sh "$PG_HOST:$PG_PORT" --strict --timeout=300 -- $SETUP_CMD
fi

exec "$@"
