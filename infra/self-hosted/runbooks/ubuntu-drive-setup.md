# Ubuntu Drive Setup Runbook

Use this runbook on the Phase 1 home server before starting Docker Compose.

## Target mount layout

| Drive | Role | Mount path |
| --- | --- | --- |
| Internal SSD | OS, Docker, databases, service state | `/srv/aomlegacy` |
| External USB 1 | Primary media library | `/mnt/aom-media-primary` |
| External USB 2 | Backup mirror | `/mnt/aom-media-backup` |
| External USB 3 | Thumbnails, cache, temp | `/mnt/aom-cache` |

## Safety warning

Formatting a drive destroys data. Confirm device names carefully before running `mkfs`.

## 1. Identify drives

```bash
lsblk -o NAME,SIZE,FSTYPE,LABEL,UUID,MOUNTPOINTS,MODEL
```

Record the device path for each drive, for example:

- `/dev/sdb1` primary media,
- `/dev/sdc1` backup media,
- `/dev/sdd1` cache.

## 2. Create partitions if needed

Only run this on empty drives intended for Family Tree storage.

```bash
sudo parted /dev/sdX --script mklabel gpt
sudo parted /dev/sdX --script mkpart primary ext4 0% 100%
```

Replace `/dev/sdX` with the correct disk, not a partition.

## 3. Format as ext4

```bash
sudo mkfs.ext4 -L AOM_MEDIA_PRIMARY /dev/sdX1
sudo mkfs.ext4 -L AOM_MEDIA_BACKUP /dev/sdY1
sudo mkfs.ext4 -L AOM_CACHE /dev/sdZ1
```

## 4. Create mount directories

```bash
sudo mkdir -p /srv/aomlegacy
sudo mkdir -p /mnt/aom-media-primary
sudo mkdir -p /mnt/aom-media-backup
sudo mkdir -p /mnt/aom-cache
```

## 5. Find UUIDs

```bash
sudo blkid
```

Copy each UUID into `/etc/fstab`.

## 6. Update `/etc/fstab`

Example:

```fstab
UUID=<primary-media-uuid> /mnt/aom-media-primary ext4 defaults,nofail,noatime 0 2
UUID=<backup-media-uuid>  /mnt/aom-media-backup  ext4 defaults,nofail,noatime 0 2
UUID=<cache-drive-uuid>   /mnt/aom-cache         ext4 defaults,nofail,noatime 0 2
```

The `nofail` option lets Ubuntu boot even if a USB drive is temporarily missing.

## 7. Mount and verify

```bash
sudo mount -a
df -h /srv/aomlegacy /mnt/aom-media-primary /mnt/aom-media-backup /mnt/aom-cache
```

## 8. Set permissions

Create a service group and grant it access to the storage paths.

```bash
sudo groupadd --force aomlegacy
sudo usermod -aG aomlegacy "$USER"
sudo chgrp -R aomlegacy /srv/aomlegacy /mnt/aom-media-primary /mnt/aom-media-backup /mnt/aom-cache
sudo chmod -R 2775 /srv/aomlegacy /mnt/aom-media-primary /mnt/aom-media-backup /mnt/aom-cache
```

Log out and back in so group membership refreshes.

## 9. Create expected subdirectories

```bash
mkdir -p /srv/aomlegacy/{immich,aom,clamav,backups/logs}
mkdir -p /mnt/aom-media-primary/immich/upload
mkdir -p /mnt/aom-media-backup/{immich/upload,aomlegacy-backups}
mkdir -p /mnt/aom-cache/{thumbs,tmp}
```

## 10. Health checks

```bash
findmnt /mnt/aom-media-primary
findmnt /mnt/aom-media-backup
findmnt /mnt/aom-cache
```

If available, install SMART tools and check drive health:

```bash
sudo apt-get update
sudo apt-get install -y smartmontools
sudo smartctl -a /dev/sdX
```

## Completion criteria

- All expected mount paths exist.
- `mount -a` succeeds without error.
- Docker service user can write to each path.
- Primary and backup drives are physically labeled.
- UUIDs are documented outside the server.
