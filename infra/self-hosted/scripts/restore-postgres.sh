#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "Usage: $0 <immich|aomlegacy> <path-to-sql-dump>" >&2
  exit 1
fi

target="$1"
dump_path="$2"

if [[ ! -f "$dump_path" ]]; then
  echo "Dump file not found: $dump_path" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STACK_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$STACK_DIR"

if [[ ! -f .env ]]; then
  echo "Missing .env. Copy .env.example to .env and fill in secrets first." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env
set +a

case "$target" in
  immich)
    service="immich-postgres"
    user="${IMMICH_DB_USERNAME:-immich}"
    database="${IMMICH_DB_NAME:-immich}"
    ;;
  aomlegacy)
    service="aom-postgres"
    user="${AOM_DB_USERNAME:-aomlegacy}"
    database="${AOM_DB_NAME:-aomlegacy}"
    ;;
  *)
    echo "Unknown target: $target. Expected immich or aomlegacy." >&2
    exit 1
    ;;
esac

echo "About to restore $target database from:"
echo "  $dump_path"
echo
echo "This will drop and recreate schema content in database '$database' on service '$service'."
read -r -p "Type RESTORE to continue: " confirmation

if [[ "$confirmation" != "RESTORE" ]]; then
  echo "Restore cancelled."
  exit 1
fi

docker compose exec -T "$service" psql -U "$user" "$database" <<SQL
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
SQL

docker compose exec -T "$service" psql -U "$user" "$database" < "$dump_path"

echo "Restore completed for $target."
