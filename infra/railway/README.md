# Railway deployment for Bizimkiler API

The NestJS API (`apps/api`) deploys to [Railway](https://railway.com) as a Nixpacks service from the **monorepo root**. Railway injects `PORT` and `DATABASE_URL` when Postgres is linked.

## Service setup

1. Create a new Railway project and connect this repository.
2. Keep the **Root Directory** at the repository root (`.`). The root `railway.json` builds `@aomlegacy/shared` then `@aomlegacy/api`.
3. Add a **PostgreSQL** plugin and link it to the API service. Railway sets `DATABASE_URL` automatically.
4. Set required environment variables on the API service (see below).
5. Deploy. Migrations run automatically on startup (`migrationsRun: true`).

## Required environment variables

| Variable | Notes |
| --- | --- |
| `AOM_JWT_SECRET` | At least 32 random bytes |
| `AOM_SESSION_SECRET` | At least 32 random bytes |
| `CORS_ORIGINS` | Comma-separated origins, e.g. `https://bizimkiler.aomlegacy.com,*.vercel.app` |

`DATABASE_URL` and `PORT` are provided by Railway when Postgres is linked and do not need to be set manually.

## Optional environment variables

| Variable | Notes |
| --- | --- |
| `SUPERADMIN_EMAIL` | Bootstrap admin account on first boot |
| `SUPERADMIN_PASSWORD_HASH` | `scrypt$<salt>$<hash>` — never store plain passwords |
| `ANTHROPIC_API_KEY` | Claude heritage assistant |
| `IMMICH_URL` / `IMMICH_API_KEY` | Immich media sync (not required for core API) |
| `BIZIMKILER_UPLOADS_DIR` | Defaults to `./uploads` — **ephemeral on Railway**; use object storage for production uploads |

## Health check

Railway uses `GET /api/health` (configured in `railway.json`). The endpoint verifies database connectivity and returns service status.

## Superadmin bootstrap

On first startup, if `SUPERADMIN_EMAIL` and `SUPERADMIN_PASSWORD_HASH` are set and no account exists for that email, an admin user is created. Generate a hash locally:

```bash
node -e "const {scryptSync,randomBytes}=require('crypto');const s=randomBytes(16);const h=scryptSync('your-password',s,64);console.log('scrypt$'+s.toString('hex')+'$'+h.toString('hex'))"
```

## Custom domain

Point `api.aomlegacy.com` (or your API hostname) to the Railway service, then set `NEXT_PUBLIC_API_BASE_URL=https://api.aomlegacy.com/api` on the web frontend.

## Local development

Local dev and Docker Compose continue to use `AOM_DB_*` variables. `DATABASE_URL` takes precedence when set (same as Railway). See `apps/api/README.md` and `AGENTS.md`.
