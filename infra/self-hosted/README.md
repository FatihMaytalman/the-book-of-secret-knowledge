# Family Tree Self-Hosted Infrastructure

This directory contains the Phase 1 home-server foundation for AOM Legacy Family Tree.

The target machine is an Ubuntu Linux laptop/server with:

- internal SSD for OS, Docker, and databases,
- primary external media drive,
- backup mirror drive,
- cache/temp drive,
- Docker Compose,
- Immich for mobile media upload,
- Tailscale for private remote access,
- and AOM Legacy services layered around Immich.

## Directory layout

```text
infra/self-hosted/
  docker-compose.yml          Phase 1 service baseline
  .env.example                Copy to .env on the server
  nginx/aomlegacy.conf        Reverse proxy config
  runbooks/                   Operational setup and recovery docs
  scripts/                    Backup and maintenance scripts
```

## Service groups

| Service | Purpose |
| --- | --- |
| `reverse-proxy` | Single HTTP entrypoint for home-server access |
| `immich-server` | Media upload, library, thumbnails, mobile sync |
| `immich-machine-learning` | Immich face/search ML support |
| `immich-redis` | Immich cache/queue dependency |
| `immich-postgres` | Immich database |
| `aom-postgres` | AOM Legacy canonical product database |
| `aom-redis` | AOM queues/cache/sessions |
| `neo4j` | Family graph relationships |
| `qdrant` | Vector search and AI retrieval |
| `clamav` | Upload malware scanning |
| `aom-api` | NestJS API scaffold with PostgreSQL migrations |
| `aom-web` | Next.js web app with design tokens and dashboard shell |

## First boot

1. Complete the drive setup runbook.
2. Copy `.env.example` to `.env`.
3. Replace every secret placeholder with a unique long random value.
4. Start the media foundation:

```bash
docker compose up -d reverse-proxy immich-server immich-machine-learning immich-redis immich-postgres
```

5. Start AOM backing services:

```bash
docker compose up -d aom-postgres aom-redis neo4j qdrant clamav
```

6. Start the AOM app profile when the API or web scaffold should run:

```bash
docker compose --profile aom-app up -d aom-api
```

7. Start the web app with the API:

```bash
docker compose --profile aom-app up -d aom-api aom-web
```

The web app is available on port `3000` and through nginx at `/login`, `/families`, and `/family/*`.

8. Configure Immich sync for the API:

```bash
# In .env
IMMICH_URL=http://immich-server:2283
IMMICH_API_KEY=<immich-admin-api-key>
```

Then trigger a sync:

```bash
curl -X POST http://localhost:8080/api/media/sync/immich \
  -H 'Content-Type: application/json' \
  -d '{"familyId":"<family-uuid>"}'
```

## Important notes

- This compose file is a Phase 1 baseline, not the final production hosted architecture.
- Keep the real `.env` on the server only.
- Do not expose the home server directly to the public internet in Phase 1.
- Use Tailscale for family/admin access until public-hosting security controls are complete.
- Verify Immich upstream release notes before major upgrades.
- Backups are not optional; media is irreplaceable.
