# Family Tree - Tooling Acceleration Playbook

This project should move fast by using more automation, local compute, and parallel AI review, not by weakening quality standards.

## What to use locally

| Tool | Use |
| --- | --- |
| Docker Desktop / Docker Compose | Run the self-hosted Immich, Postgres, Redis, Neo4j, Qdrant, ClamAV, API, and web stack locally. |
| Ollama | Run local/private code review and planning prompts without sending family data to a cloud LLM. |
| Kimi API | Run long-context architecture/code review using Moonshot/Kimi's OpenAI-compatible API. |
| Biome | Fast local lint and formatting. |
| GitHub Actions | PR quality gate for lint, test, typecheck, build, and critical audit. |
| Dependabot | Keep npm, GitHub Actions, and Docker Compose dependencies moving safely. |

## Local setup checks

Run:

```bash
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

Set:

```bash
export MOONSHOT_API_KEY="..."
export KIMI_MODEL="kimi-k2.6"
```

Run:

```bash
npm run ai:review:kimi -- --prompt "Review the auth and family-scoping plan before implementation."
```

The script sends the branch diff against `origin/master` by default. You can override:

```bash
npm run ai:review:kimi -- --base HEAD~1 --prompt "Review only my latest commit."
```

## Ollama acceleration

Ollama is useful for private/offline review of local code and runbooks.

Recommended coding models to try locally:

- `qwen2.5-coder:7b` for fast code review on modest hardware.
- `qwen2.5-coder:14b` or larger if your machine can run it.
- Any stronger local model you already have installed.

Run:

```bash
ollama pull qwen2.5-coder:7b
export OLLAMA_MODEL="qwen2.5-coder:7b"
npm run ai:review:ollama -- --prompt "Find missing tests in the media sync code."
```

## Docker acceleration

Validate the self-hosted stack:

```bash
npm run docker:selfhost:config
```

Start locally after creating a real `.env` from the template:

```bash
cp infra/self-hosted/.env.example infra/self-hosted/.env
# edit secrets and local paths
npm run docker:selfhost:up
```

Stop:

```bash
npm run docker:selfhost:down
```

## No-compromise development loop

Before every push:

```bash
npm run lint
npm run test
npm run typecheck
npm run build
npm audit --omit=dev --audit-level=critical
```

Use AI review before large changes:

```bash
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
