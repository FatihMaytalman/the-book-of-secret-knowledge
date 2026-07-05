#!/usr/bin/env bash
set -euo pipefail

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

timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
backup_root="${MEDIA_BACKUP_PATH:-/mnt/aom-media-backup}/aomlegacy-backups"
backup_dir="$backup_root/$timestamp"
log_dir="${BACKUP_LOG_PATH:-/srv/aomlegacy/backups/logs}"

mkdir -p "$backup_dir/postgres" "$backup_dir/neo4j" "$backup_dir/manifests" "$log_dir"

log_file="$log_dir/backup-$timestamp.log"
exec > >(tee -a "$log_file") 2>&1

echo "Starting AOM Legacy backup at $timestamp"
echo "Backup directory: $backup_dir"

echo "Checking compose services..."
docker compose ps

echo "Mirroring Immich original uploads..."
mkdir -p "${MEDIA_BACKUP_PATH:-/mnt/aom-media-backup}/immich/upload"
rsync -aHAX --delete --numeric-ids \
  "${MEDIA_PRIMARY_PATH:-/mnt/aom-media-primary}/immich/upload/" \
  "${MEDIA_BACKUP_PATH:-/mnt/aom-media-backup}/immich/upload/"

echo "Dumping Immich PostgreSQL..."
docker compose exec -T immich-postgres \
  pg_dump -U "${IMMICH_DB_USERNAME:-immich}" "${IMMICH_DB_NAME:-immich}" \
  > "$backup_dir/postgres/immich.sql"

echo "Dumping AOM Legacy PostgreSQL..."
docker compose exec -T aom-postgres \
  pg_dump -U "${AOM_DB_USERNAME:-aomlegacy}" "${AOM_DB_NAME:-aomlegacy}" \
  > "$backup_dir/postgres/aomlegacy.sql"

echo "Dumping Neo4j with brief service stop..."
docker compose stop neo4j
docker compose run --rm \
  -v "$backup_dir/neo4j:/backups" \
  neo4j neo4j-admin database dump neo4j --to-path=/backups --overwrite-destination=true
docker compose start neo4j

echo "Writing checksum manifest..."
find "$backup_dir" -type f -print0 | sort -z | xargs -0 sha256sum > "$backup_dir/manifests/SHA256SUMS"

echo "Pruning old backup directories..."
find "$backup_root" -mindepth 1 -maxdepth 1 -type d -mtime +"${BACKUP_RETENTION_DAYS:-30}" -print -exec rm -rf {} +

echo "Backup completed successfully at $(date -u +%Y%m%dT%H%M%SZ)"
