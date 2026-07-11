<h1 align="center">Bizimkiler</h1>

<p align="center"><i>Bizimkiler — One Photo. One Memory. One Family.</i></p>

<p align="center">An <b>AOM Legacy</b> platform &nbsp;•&nbsp; <a href="https://AOMLegacy.com">AOMLegacy.com</a></p>

---

## What is Bizimkiler?

Bizimkiler is a **self-hosted-first, AI-assisted platform for preserving a family's entire digital
legacy** — photos, videos, documents, stories, people, and relationships — in one private, permanent
place that the family owns.

It is not a photo app and not "just" a family tree. It combines a private media cloud, a genealogy
graph, a collaborative archive, an AI heritage assistant, and a long-term preservation system into a
single product that can run on a home server today and scale to the cloud later.

## The problem it solves

Families live inside messaging apps and social platforms that optimize for sharing, not for keeping.
The same photo gets re-downloaded by everyone, storage fills up, context is lost, and irreplaceable
history stays scattered across WhatsApp, Facebook, Instagram, iCloud, and Google Photos — and
disappears when accounts lapse, phones are lost, or loved ones pass away.

Bizimkiler creates **one trusted place** where:

- everyone uploads once and duplicate copies are detected and linked automatically (the "WhatsApp
  duplication" problem disappears),
- memories are connected to the **people**, places, dates, and stories behind them,
- family relationships form a real, queryable **family graph**,
- AI helps transcribe, translate, caption, and summarize — but humans stay in control,
- and the full archive can be **exported in open formats** so it outlives any single device,
  subscription, or app.

## Core capabilities

| Area | What it does |
| --- | --- |
| Private media cloud | Ingests family photos/videos (Immich for mobile upload in Phase 1) |
| Deduplication engine | Exact (SHA-256) + perceptual matching → one canonical asset, many upload instances |
| People & genealogy | Person profiles, life events, timelines, and a relationship graph |
| AI heritage assist | OCR, transcription, translation, biography drafts, citation-based Q&A (review-gated) |
| Collaboration & governance | Roles, invitations, approvals, and an append-only audit log |
| Social hub | Import from / publish to social platforms with provenance and consent controls |
| Preservation | Backups, restore runbooks, and open export (media + JSON/CSV/GEDCOM) |

## Monorepo layout

```text
apps/api        NestJS API — canonical data (families, people, media, dedup, audit, social)
apps/web        Next.js (App Router) web app — dashboard, timeline, people, tree, media, review
apps/mobile     Planned React Native / Expo app (family workflows + background upload)
packages/shared Shared TypeScript domain contracts (@aomlegacy/shared)
infra/self-hosted  Docker Compose home-server stack (Immich, Postgres, Tailscale) + runbooks
docs/family-tree   Product & architecture master plan (18-phase baseline)
```

## Quickstart (development)

Requires **Node.js >= 22**. From the repository root:

```bash
npm install                # install all workspaces

npm run dev:api            # start the NestJS API (http://localhost:3001)
npm run dev:web            # start the Next.js web app (http://localhost:3000)
```

Per-app setup and environment variables are documented in each app's README:

- API: [`apps/api/README.md`](apps/api/README.md)
- Web: [`apps/web/README.md`](apps/web/README.md)
- Self-hosted stack: [`infra/self-hosted/README.md`](infra/self-hosted/README.md)

Root workspace scripts: `npm run build`, `npm run typecheck`, `npm run lint`
(each runs across workspaces with `--if-present`).

## Documentation

The full product and architecture baseline lives in
[`docs/family-tree/master-plan.md`](docs/family-tree/master-plan.md).

## License

See [`LICENSE.md`](LICENSE.md).
