#!/usr/bin/env bash
# Usage: wait-for-postgres.sh <host> [port] -- <command> [args]
#
# Waits for PostgreSQL to accept connections, then runs the command.
# A host that starts with "/" is a unix socket directory, the way libpq reads PG_HOST
# (e.g. Cloud SQL on Cloud Run mounts /cloudsql/<project>:<region>:<instance>).
# wait-for-it.sh only probes TCP ports, so for a socket we wait for <host>/.s.PGSQL.<port>.

host="$1"
port="${2:-5432}"
shift 2
[ "$1" = "--" ] && shift
timeout="${WAIT_FOR_POSTGRES_TIMEOUT:-300}"

if [[ "$host" != /* ]]; then
  exec "$(dirname "$0")/wait-for-it.sh" "$host:$port" --strict --timeout="$timeout" -- "$@"
fi

socket="$host/.s.PGSQL.$port"
echo "wait-for-postgres: waiting $timeout seconds for $socket"
for ((elapsed = 0; elapsed < timeout; elapsed++)); do
  if [ -S "$socket" ]; then
    echo "wait-for-postgres: $socket is available after $elapsed seconds"
    exec "$@"
  fi
  sleep 1
done

echo "wait-for-postgres: timeout occurred after waiting $timeout seconds for $socket" >&2
exit 1
