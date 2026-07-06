# Backup and Restore Runbook

Family media is irreplaceable. AOM Legacy must treat backup and restore as a product feature, not an operations afterthought.

## Backup scope

The Phase 1 backup process covers:

- Immich original uploads,
- Immich PostgreSQL database,
- AOM Legacy PostgreSQL database,
- Neo4j family graph database,
- checksum manifests,
- backup logs.

Redis, thumbnails, model caches, and temporary files are not archival sources of truth. They can be rebuilt.

## Backup locations

| Data | Primary | Backup |
| --- | --- | --- |
| Immich originals | `/mnt/aom-media-primary/immich/upload` | `/mnt/aom-media-backup/immich/upload` |
| Backup bundles | N/A | `/mnt/aom-media-backup/aomlegacy-backups` |
| Logs | `/srv/aomlegacy/backups/logs` | Include in offsite backups |

## Manual backup

```bash
cd infra/self-hosted
cp .env.example .env # only first time, then fill secrets
chmod +x scripts/backup.sh
./scripts/backup.sh
```

## Nightly backup with cron

Run:

```bash
crontab -e
```

Add:

```cron
30 2 * * * cd /path/to/repo/infra/self-hosted && ./scripts/backup.sh
```

## Verify backup success

After backup:

```bash
latest="$(ls -1dt /mnt/aom-media-backup/aomlegacy-backups/* | head -n 1)"
cat "$latest/manifests/SHA256SUMS"
sha256sum -c "$latest/manifests/SHA256SUMS"
```

Also confirm:

- media files exist on the backup drive,
- `postgres/immich.sql` exists,
- `postgres/aomlegacy.sql` exists,
- `neo4j/neo4j.dump` exists,
- the backup log ends with success.

## Restore drill schedule

Run a restore drill:

- before public beta,
- after major schema changes,
- after changing backup scripts,
- after replacing a drive,
- at least monthly for active family archive usage.

## PostgreSQL restore

Use the helper script:

```bash
cd infra/self-hosted
chmod +x scripts/restore-postgres.sh
./scripts/restore-postgres.sh immich /mnt/aom-media-backup/aomlegacy-backups/<timestamp>/postgres/immich.sql
./scripts/restore-postgres.sh aomlegacy /mnt/aom-media-backup/aomlegacy-backups/<timestamp>/postgres/aomlegacy.sql
```

The script requires typing `RESTORE` before it drops schema content.

## Neo4j restore

Stop Neo4j before restore:

```bash
cd infra/self-hosted
docker compose stop neo4j
```

Restore from a dump:

```bash
docker compose run --rm \
  -v /mnt/aom-media-backup/aomlegacy-backups/<timestamp>/neo4j:/backups \
  neo4j neo4j-admin database load neo4j --from-path=/backups --overwrite-destination=true
```

Start Neo4j:

```bash
docker compose start neo4j
```

## Media restore

If the primary media drive fails:

1. Stop the stack.
2. Replace and mount a new primary drive at `/mnt/aom-media-primary`.
3. Copy mirrored uploads back:

```bash
rsync -aHAX --numeric-ids /mnt/aom-media-backup/immich/upload/ /mnt/aom-media-primary/immich/upload/
```

4. Start the stack.
5. Verify media opens in Immich.
6. Run checksum verification where available.

## Offsite backup recommendation

The mirror drive protects against one local drive failure. It does not protect against theft, fire, flood, ransomware, or accidental deletion that syncs to the mirror.

Add an encrypted offsite backup using a tool such as restic or borg before storing irreplaceable archives at scale.

## Completion criteria

- Nightly backup job exists.
- Backups include media, PostgreSQL, Neo4j, manifests, and logs.
- At least one restore drill has succeeded.
- Offsite encrypted backup is planned before public beta.
