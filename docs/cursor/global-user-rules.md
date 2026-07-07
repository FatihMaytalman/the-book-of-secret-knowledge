# Cursor global user rules — local-first development

Use this rule in **every** project by adding it to Cursor **User Rules** (applies workspace-wide) or by copying `.cursor/rules/maximise-local-resources.mdc` into each repository.

## Apply to all projects (recommended)

1. Open **Cursor Settings** → **Rules** → **User Rules**.
2. Paste the block below.
3. Save. User Rules apply to every project automatically.

## User Rules text (copy from here)

```
This machine has: Ollama (local LLMs), Kimi AI, Docker Desktop, and full developer CLIs (git, node, docker, wrangler, vercel, supabase). Maximise local resources: offload repetitive generation (tests, boilerplate, docs) to Ollama; use Docker containers for all databases and services rather than host installs or mocks; run builds/tests/lints locally and report summarised results only. Minimise external API token usage — do heavy analysis locally first. Windows 11 host; enter terminal commands one at a time (PowerShell paste concatenates commands). Use British spelling.
```

## Per-project rule (alternative)

This repository already includes:

```
.cursor/rules/maximise-local-resources.mdc
```

Copy that file into any other project's `.cursor/rules/` directory. The `alwaysApply: true` frontmatter makes it active without manual @-mentioning.

## What agents should do

| Area | Local-first behaviour |
|------|----------------------|
| Tests & boilerplate | Draft with Ollama; refine in-editor |
| Databases & services | `docker compose` only — no host Postgres/Redis installs |
| CI parity | Run `npm run build`, `npm run test`, `npm run lint` locally before pushing |
| API usage | Explore and analyse locally; call paid APIs only when necessary |
| Terminal (Windows) | One command per invocation in PowerShell |
| Prose | British English (colour, organise, minimise, etc.) |

## Ollama quick reference

```powershell
ollama list
ollama run llama3.2 "Generate Jest tests for this function: ..."
```

Use a model already pulled on the machine; prefer smaller models for boilerplate, larger models for complex logic.

## Docker quick reference

```powershell
docker compose -f infra/self-hosted/docker-compose.yml up -d
docker compose ps
docker compose logs --tail 50 <service>
```

Check project `infra/` or root `docker-compose.yml` before proposing new services.
