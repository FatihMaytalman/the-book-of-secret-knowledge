# Vercel deployment for Kinvault web

The Vercel project `the-book-of-secret-knowledge-web` (legacy project name) must build the
**monorepo workspace**, not the repository root package.

## Required Vercel project settings

In [Vercel Dashboard](https://vercel.com/aomlegacy/the-book-of-secret-knowledge-web/settings):

| Setting | Value |
| --- | --- |
| **Root Directory** | `apps/web` |
| **Framework Preset** | Next.js |
| **Install Command** | `cd ../.. && npm install` |
| **Build Command** | `cd ../.. && npm run build -w packages/shared && npm run build -w apps/web` |
| **Node.js Version** | 22.x |

Or keep Root Directory empty and use the root `vercel.json` in this repository.

## Environment variables

| Variable | Example |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | `https://api.aomlegacy.com/api` |
| `NEXT_PUBLIC_SITE_URL` | `https://aomlegacy.com` |

Set `NEXT_PUBLIC_API_BASE_URL` on every Vercel environment (including previews). Without it,
server-rendered pages that call the API will fall back to `http://localhost:8080/api`, which is not
reachable from Vercel build workers or edge runtimes.

## Note on Cloudflare vs Vercel

Cloudflare Workers (via OpenNext) is the recommended production host for AOMLegacy.com. Vercel can remain for preview deployments, or disconnect it once Cloudflare is live.
