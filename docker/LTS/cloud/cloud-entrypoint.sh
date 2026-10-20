#!/bin/bash
set -e

npm cache clean --force

if [ -d "./server/dist" ]; then
  SETUP_CMD='npm run cloud:setup:prod'
else
  SETUP_CMD='npm run cloud:setup'
fi

npm cache clean --force

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
