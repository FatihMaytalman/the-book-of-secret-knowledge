# AOM Legacy Web App

Planned stack: **Next.js App Router**, **React**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, and **TanStack Query**.

The web app is the primary browser experience for:

- family dashboard,
- media timeline,
- people directory,
- person profiles,
- interactive family tree,
- duplicate review queue,
- face/OCR/AI review queues,
- social connection settings,
- private family feed,
- outbound publish previews,
- backup and export administration,
- permissions and invitations.

## Phase 1 screens

1. Sign in and family switcher.
2. Family dashboard with recent uploads and backup health.
3. People directory.
4. Person profile with attached media and life events.
5. Timeline view.
6. Media review queue for exact/near duplicate decisions.
7. Admin settings for invites, backups, and exports.

## Current scaffold

The initial App Router shell includes:

- `/` - museum-style dashboard and Phase 1 readiness overview.
- `/people` - starter family profile cards.
- `/review` - deduplication review concepts.
- `/social` - Phase 18 social import/feed/publish hub.

The scaffold uses a Next.js canary release because the latest stable line available during setup still resolved a vulnerable transitive PostCSS version in `npm audit`. Revisit this pin when a stable Next.js release includes the patched PostCSS dependency.

## Local commands

From the repository root:

```bash
npm run dev:web
npm run typecheck -w apps/web
npm run build -w apps/web
```

## Design foundation

The design system follows the premium heritage identity in `docs/family-tree/master-plan.md`:

- Dark Navy `#0D1B2A`
- Polished Gold `#C9A84C`
- Turquoise `#2EC4B6`
- Deep Charcoal `#1A1A2E`
- Soft Cream `#F8F4EE`
- Warm White `#F0EDE8`
