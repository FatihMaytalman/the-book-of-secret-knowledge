# AGENTS.md

## Cursor Cloud specific instructions

**Bizimkiler** (an **AOM Legacy** platform) is a monorepo for a private, self-hosted-first family
digital-legacy platform. Product/marketing name: **Bizimkiler — One Photo. One Memory. One Family.**
Company/brand and technical namespace: **AOM Legacy** (npm scope `@aomlegacy/*`, DB defaults/env
`AOM_*`). Do not rename the `@aomlegacy/*` scope or `AOM_*` env vars — they are used pervasively
across imports, `package-lock` files, and DB config.

> Historical note: this repo began as a fork of an unrelated Markdown "awesome list"
> (`the-book-of-secret-knowledge`). All of that book content has been replaced — the root
> `README.md` now describes Bizimkiler. There is **no static "book" to render/deploy**; the product is
> the application under `apps/`.

### Layout

- `apps/api` — NestJS + TypeScript API (Fastify adapter), TypeORM + PostgreSQL. Owns canonical data:
  families, people, memories, invites, comments, reactions, relationships, media assets, dedup, audit.
  Listens on `:3001`.
- `apps/web` — Next.js (App Router) + React + Tailwind v4 + TanStack Query. Listens on `:3000`.
- `apps/mobile` — planned React Native/Expo app (README only for now).
- `packages/shared` — shared TS domain contracts, imported as `@aomlegacy/shared`.
- `infra/self-hosted` — Docker Compose home-server stack (Immich, Postgres, Tailscale) + runbooks.
- `docs/family-tree` — product/architecture master plan.

### Build / run / test / lint

Node **>= 22**. Standard commands are already documented — prefer these sources over duplicating:

- Root workspace scripts (see root `package.json`): `npm install`, `npm run build`,
  `npm run typecheck`, `npm run lint` (all run per-workspace with `--if-present`), plus
  `npm run dev:api` and `npm run dev:web`.
- Per-app setup, env vars, and endpoints: `apps/api/README.md` and `apps/web/README.md`.
- Self-hosted/Docker stack: `infra/self-hosted/README.md`.

### Local database for the API (dev)

The API needs a reachable PostgreSQL and runs TypeORM migrations automatically on startup.
`infra/self-hosted` provides a Docker Compose Postgres, but if Docker is unavailable, a local
Postgres works. One-time bring-up (idempotent):

```bash
sudo apt-get update && sudo apt-get install -y postgresql postgresql-contrib
sudo pg_ctlcluster 16 main start            # or: sudo service postgresql start
sudo -u postgres psql -c "CREATE ROLE aomlegacy LOGIN PASSWORD 'aomlegacy_local_dev_pw';"
sudo -u postgres createdb -O aomlegacy aomlegacy
# then in apps/api/.env set AOM_DB_* to match (see apps/api/.env.example)
```

For the web app to reach the API directly during dev (bypassing the Compose reverse proxy on
`:8080`), set `NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api` in `apps/web/.env.local`.

### Non-obvious caveats

- **API runtime is Fastify, not Express.** `@nestjs/core` still pulls `@nestjs/platform-express`
  (and a vulnerable Multer) transitively; it is unused. Do not enable Nest Express uploads until a
  patched Multer is verified (see `apps/api/README.md`).
- **Next.js is pinned to stable `16.2.10`** via root `package.json` overrides (avoids Vercel deploy
  issues with canary immutable static uploads).
- The API runs TypeORM migrations automatically on startup and needs a reachable PostgreSQL (see
  `apps/api/.env.example` / `AOM_DB_*`). Immich integration needs `IMMICH_URL` + `IMMICH_API_KEY`.
- Memory photo uploads use `BIZIMKILER_UPLOADS_DIR` (defaults to `./uploads` under the API process).
- There is no automated test suite wired up yet; validate changes via `typecheck`/`build` and by
  running the affected app.
