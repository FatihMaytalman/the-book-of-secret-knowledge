# Family Tree Planning Package

Project: **Family Tree**  
Organization: **AOM Legacy**  
Domain: **AOMLegacy.com**  
Founder: **Fatih Maytalman**

This directory contains the sequenced master planning artifact for the Family Tree platform. It starts with the Product Requirements Document and continues through architecture, data modeling, AI, security, UX, infrastructure, cost, MVP, deduplication, production release planning, and social network integration.

## Documents

- [Unified Master Plan](./master-plan.md) - all 18 requested phases in order.
- [Full Execution Team](./execution-team.md) - team structure, roles, squads, hiring order, quality gates, and operating cadence.
- [Tooling Acceleration Playbook](./tooling-acceleration.md) - local Docker, Ollama, Kimi, CI, and AI-agent workflows for faster no-compromise delivery.
- [Self-Hosted Infrastructure](../../infra/self-hosted/README.md) - Docker Compose baseline, environment template, and operations runbooks.
- [AOM Legacy API](../../apps/api/README.md) - backend service responsibilities and Immich boundary.
- [AOM Legacy Web App](../../apps/web/README.md) - browser experience scope and Phase 1 screens.
- [AOM Legacy Mobile App](../../apps/mobile/README.md) - mobile app scope and upload strategy.

## Core product position

Family Tree is a private digital family legacy ecosystem, not a conventional genealogy site. The product combines:

- self-hosted family media storage,
- an AI-assisted heritage archive,
- a graph-based family tree,
- collaborative storytelling,
- a private family social layer with external import/export channels,
- long-term exportability,
- and a deduplication engine designed around the "WhatsApp problem."

## First implementation bias

Phase 1 should use proven open-source infrastructure where possible:

- **Immich** for battle-tested media ingestion, mobile background upload, thumbnails, and initial face/object indexing.
- **AOM Legacy API** for identity, family profiles, permissions, genealogy graph orchestration, deduplication policy, AI workflows, and auditability.
- **PostgreSQL + Neo4j + Redis + vector search** as the durable product backbone.
- **Tailscale-first access** for the home-server MVP, with a clean migration path to Cloudflare R2/S3 and Kubernetes.
