# Family Tree - Tooling Acceleration Playbook

This project should move fast by using more automation, local compute, containers, and parallel AI review, not by weakening quality standards.

## Local execution policy

The founder's primary development machine is a Windows 11 host with Docker Desktop, Ollama, Kimi AI access, and full developer CLIs such as git, node, docker, wrangler, vercel, and supabase.

Rules for local work:

1. Prefer local compute first. Use Ollama for repetitive generation, first-pass code review, tests, boilerplate, and documentation drafts.
2. Use Kimi only after local analysis when long context, stronger architecture review, or a second opinion is worth external API usage.
3. Use Docker containers for databases and platform services. Do not install Postgres, Redis, Neo4j, Qdrant, ClamAV, or Immich directly on the host.
4. Avoid mocks for service integration once a Docker service exists. Use mocks only for focused unit tests.
5. Run builds, tests, linting, and type checks locally before pushing.
6. Report summarised results only: command, pass/fail, important errors, and known caveats.
7. In Windows PowerShell, enter terminal commands one at a time. Do not paste chained command blocks.
8. Use British spelling in project-facing documentation and status reports where new text is added.

## What to use locally

| Tool | Use |
| --- | --- |
| Docker Desktop / Docker Compose | Run the self-hosted Immich, Postgres, Redis, Neo4j, Qdrant, ClamAV, API, and web stack locally. |
| Ollama | Run local/private code review and planning prompts without sending family data to a cloud LLM. |
| Kimi API | Run long-context architecture/code review using Moonshot/Kimi's OpenAI-compatible API. |
| wrangler | Prepare future Cloudflare Workers/R2/CDN tasks from the cloud-migration phase. |
| vercel | Validate optional preview/deployment paths for the Next.js web app if needed. |
| supabase | Useful for quick hosted Postgres experiments, but not the primary self-hosted architecture. |
| Biome | Fast local lint and formatting. |
| GitHub Actions | PR quality gate for lint, test, typecheck, build, and critical audit. |
| Dependabot | Keep npm, GitHub Actions, and Docker Compose dependencies moving safely. |

## Local setup checks

Run:

```powershell
npm run doctor
```

The doctor checks Node, npm, GitHub CLI, Docker, Docker Compose, Ollama, key repo files, and optional AI environment variables.

## Kimi acceleration

Kimi is useful for:

- long-context architecture review,
- security and privacy review,
- API/schema consistency review,
- migration review,
- release checklist review.

Set Kimi/Moonshot credentials in PowerShell:

```powershell
$env:MOONSHOT_API_KEY="..."
```

```powershell
$env:KIMI_MODEL="kimi-k2.6"
```

Run:

```powershell
npm run ai:review:kimi -- --prompt "Review the auth and family-scoping plan before implementation."
```

The script sends the branch diff against `origin/master` by default. You can override:

```powershell
npm run ai:review:kimi -- --base HEAD~1 --prompt "Review only my latest commit."
```

## Ollama acceleration

Ollama is useful for private/offline review of local code and runbooks.

Recommended coding models to try locally:

- `qwen2.5-coder:7b` for fast code review on modest hardware.
- `qwen2.5-coder:14b` or larger if your machine can run it.
- Any stronger local model you already have installed.

Run:

```powershell
ollama pull qwen2.5-coder:7b
```

```powershell
$env:OLLAMA_MODEL="qwen2.5-coder:7b"
```

```powershell
npm run ai:review:ollama -- --prompt "Find missing tests in the media sync code."
```

Local-first review order:

1. Run `npm run ai:review:ollama` for repetitive review, test ideas, boilerplate checks, and documentation drafts.
2. Run Kimi only for large-context architecture review, security review, or when Ollama output is not strong enough.
3. Never send real private family data, secrets, or production media to an external model.

## Docker acceleration

Validate the self-hosted stack:

```powershell
npm run docker:selfhost:config
```

Start locally after creating a real `.env` from the template:

```powershell
Copy-Item infra/self-hosted/.env.example infra/self-hosted/.env
```

Edit `infra/self-hosted/.env` in your editor. Set real secrets and Windows-compatible drive paths before starting containers.

```powershell
npm run docker:selfhost:up
```

Stop:

```powershell
npm run docker:selfhost:down
```

Docker-first service policy:

- Use `aom-postgres` instead of a host Postgres install.
- Use `aom-redis` instead of a host Redis install.
- Use the Compose Neo4j, Qdrant, ClamAV, and Immich services.
- Run migrations against the Docker Postgres service.
- Keep host installs limited to developer CLIs and local LLM tools.

## No-compromise development loop

Before every push, run each command separately in PowerShell:

```powershell
npm run lint
```

```powershell
npm run test
```

```powershell
npm run typecheck
```

```powershell
npm run build
```

```powershell
npm audit --omit=dev --audit-level=critical
```

Report results as a short summary, for example:

- lint: pass
- tests: pass, 4 tests
- typecheck: pass
- build: pass
- critical audit: pass; known high-severity NestJS transitive Multer caveat remains

Use local AI review before large changes:

```powershell
npm run ai:review:ollama -- --prompt "Review this diff for privacy, security, tests, and architectural rework risk."
```

Escalate to Kimi when needed:

```powershell
npm run ai:review:kimi -- --prompt "Review this diff for privacy, security, tests, and architectural rework risk."
```

## Best use of multiple AI agents

Use separate agents for bounded outputs:

1. **Architect reviewer** - checks if the work preserves the master plan.
2. **Security reviewer** - checks auth, RBAC, uploads, secrets, audit logs.
3. **Test engineer** - generates missing unit/integration/e2e tests.
4. **DevOps reviewer** - checks Docker, runbooks, backups, restore paths.
5. **UX reviewer** - checks accessibility and age 8-to-88 usability.

Do not let agents make final decisions on:

- privacy policy,
- deletion/retention rules,
- living person/minor visibility,
- memorial pages,
- deduplication thresholds that could delete originals,
- AI-generated family facts.

Those require human approval.
