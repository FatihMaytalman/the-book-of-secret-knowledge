# Self-Hosted Operations Checklist

Use this checklist before trusting the Phase 1 home server with real family data.

## Daily checks

- [ ] Server is online.
- [ ] Tailscale is connected.
- [ ] Immich web/mobile login works.
- [ ] Recent mobile uploads completed.
- [ ] Docker containers are healthy.
- [ ] Disk usage is below alert thresholds.
- [ ] Backup log from the last run shows success.

Commands:

```bash
cd infra/self-hosted
docker compose ps
df -h /srv/aomlegacy /mnt/aom-media-primary /mnt/aom-media-backup /mnt/aom-cache
tailscale status
```

## Weekly checks

- [ ] Review failed uploads.
- [ ] Review duplicate candidates.
- [ ] Confirm backup manifests validate.
- [ ] Check drive health.
- [ ] Apply Ubuntu security updates.
- [ ] Review Tailscale device list and remove stale devices.

Commands:

```bash
sudo apt-get update
sudo apt-get upgrade
sudo smartctl -a /dev/sdX
```

## Monthly checks

- [ ] Perform a restore drill.
- [ ] Export a small family metadata bundle.
- [ ] Review admin accounts and MFA.
- [ ] Review audit logs once implemented.
- [ ] Confirm offsite backup status once configured.
- [ ] Update runbooks based on what actually happened.

## Storage thresholds

| Path | Warning | Critical |
| --- | --- | --- |
| `/srv/aomlegacy` | 75% | 90% |
| `/mnt/aom-media-primary` | 75% | 90% |
| `/mnt/aom-media-backup` | 75% | 90% |
| `/mnt/aom-cache` | 80% | 95% |

At warning level, plan cleanup or storage expansion. At critical level, stop non-essential imports and resolve immediately.

## Before inviting a family member

- [ ] Their Tailscale access is correct.
- [ ] They have their own app account.
- [ ] They understand upload privacy defaults.
- [ ] They know how to report a lost device.
- [ ] A test upload from their phone succeeds.

## Before importing an old archive

- [ ] Backup completed successfully.
- [ ] Primary drive has enough free space.
- [ ] Backup drive has enough free space.
- [ ] Import source is malware-scanned if untrusted.
- [ ] Deduplication strategy is understood.
- [ ] Import is batched, not all-or-nothing.

## Incident triggers

Treat these as incidents:

- failed backups for more than one scheduled run,
- primary or backup drive errors,
- malware detection,
- unauthorized login attempt patterns,
- unexpected public exposure of the service,
- media missing after import,
- suspected false duplicate merge,
- lost admin device.

## Incident response basics

1. Preserve logs.
2. Stop the affected service if data may be at risk.
3. Revoke suspicious sessions/devices.
4. Verify backups before destructive actions.
5. Document what happened and what changed.
6. Add a prevention task to the roadmap.
