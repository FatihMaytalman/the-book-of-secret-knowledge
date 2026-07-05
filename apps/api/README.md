# AOM Legacy API

Planned stack: **NestJS**, **TypeScript**, **PostgreSQL**, **Neo4j**, **Redis/BullMQ**, and a vector database.

This service will own Family Tree's canonical product data:

- families and memberships,
- person profiles,
- relationship graph orchestration,
- canonical media asset records,
- deduplication decisions,
- document/OCR state,
- AI workflow state,
- audit logs,
- exports,
- and backup health reporting.

## Phase 1 responsibilities

1. Authenticate family members.
2. Store family/person/media metadata in PostgreSQL.
3. Sync newly uploaded Immich assets into AOM canonical media tables.
4. Calculate exact duplicate hashes.
5. Create one canonical media asset with many upload/source instances.
6. Emit audit events for sensitive mutations.
7. Provide REST/GraphQL APIs for the web app.

## Boundary with Immich

Immich handles media upload, thumbnails, mobile backup, and its own media library workflows. The AOM Legacy API treats Immich as the Phase 1 media subsystem and stores first-party canonical metadata outside Immich so the Family Tree product remains portable.
