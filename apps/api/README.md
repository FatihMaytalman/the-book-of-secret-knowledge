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
