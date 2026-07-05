# AOM Legacy API

NestJS service for the Family Tree platform. This scaffold implements Phase 1 database foundations and module boundaries described in the master plan.

Stack: **NestJS**, **TypeScript**, **PostgreSQL**, **TypeORM**.

## Phase 1 status

Implemented in this scaffold:

- PostgreSQL entities and initial migration for identity, family, person, media, and audit tables.
- Module boundaries for `Auth`, `Families`, `People`, `Media`, `Audit`, and `Health`.
- Automatic migration execution on startup.
- Health endpoint at `GET /api/health`.

Planned next:

- Authentication and family-scoped authorization.
- Immich asset sync proof of concept.
- SHA-256 exact duplicate canonicalization.
- REST endpoints for people and media metadata.

## Local development

```bash
cd apps/api
cp .env.example .env
npm install
npm run start:dev
```

The API listens on port `3001` by default.

Run migrations manually if needed:

```bash
npm run migration:run
```

## Docker Compose integration

When the self-hosted stack is running, start the API with:

```bash
cd infra/self-hosted
docker compose --profile aom-app up -d aom-api
```

The reverse proxy exposes the API at `http://localhost:8080/api/`.

## Canonical product data

This service owns Family Tree's canonical product data:

- families and memberships,
- person profiles,
- canonical media asset records,
- deduplication decisions,
- audit logs,
- and future AI, social, and export workflows.

Immich remains the Phase 1 media upload subsystem. AOM Legacy stores first-party metadata outside Immich so the product stays portable.

## Phase 1 responsibilities

1. Authenticate family members.
2. Store family/person/media metadata in PostgreSQL.
3. Sync newly uploaded Immich assets into AOM canonical media tables.
4. Calculate exact duplicate hashes.
5. Create one canonical media asset with many upload/source instances.
6. Emit audit events for sensitive mutations.
7. Provide REST/GraphQL APIs for the web app.
8. Prepare module boundaries for future social import, private feed, and publish-out workflows.

## Boundary with Immich

Immich handles media upload, thumbnails, mobile backup, and its own media library workflows. The AOM Legacy API treats Immich as the Phase 1 media subsystem and stores first-party canonical metadata outside Immich so the Family Tree product remains portable.

## Current scaffold

The initial NestJS scaffold includes:

- `GET /api/health`
- `GET /api/people`
- `GET /api/people/:id`
- `GET /api/media`
- `GET /api/media/deduplication-candidates`
- `GET /api/social/connections`
- `GET /api/social/provenance`

Initial PostgreSQL migrations live in `migrations/`.

The API uses `@nestjs/platform-fastify` as its runtime adapter. As of this scaffold, `@nestjs/core` still installs `@nestjs/platform-express` transitively, which brings a vulnerable Multer version into `npm audit` even though the application does not use the Express adapter or Multer upload handling. Do not enable Nest Express uploads until the upstream dependency resolves to a patched Multer release or a safe override is verified.

## Local commands

From the repository root:

```bash
npm run dev:api
npm run typecheck -w apps/api
npm run build -w apps/api
```
