#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

const checks = [
  {
    name: 'shared package build',
    command: 'npm',
    args: ['run', 'build', '-w', 'packages/shared'],
    cwd: root,
  },
  {
    name: 'api typecheck',
    command: 'npm',
    args: ['run', 'typecheck', '-w', 'apps/api'],
    cwd: root,
  },
  {
    name: 'web typecheck',
    command: 'npm',
    args: ['run', 'typecheck', '-w', 'apps/web'],
    cwd: root,
  },
  {
    name: 'web production build',
    command: 'npm',
    args: ['run', 'build', '-w', 'apps/web'],
    cwd: root,
  },
  {
    name: 'api production build',
    command: 'npm',
    args: ['run', 'build', '-w', 'apps/api'],
    cwd: root,
  },
  {
    name: 'cloudflare opennext build',
    command: 'npx',
    args: ['opennextjs-cloudflare', 'build'],
    cwd: join(root, 'apps/web'),
  },
];

const requiredFiles = [
  'apps/web/wrangler.toml',
  'apps/web/open-next.config.ts',
  'apps/web/vercel.json',
  'vercel.json',
  'infra/vercel/README.md',
  'apps/api/src/modules/ai/ai.module.ts',
  'infra/self-hosted/nginx/aomlegacy.conf',
];

function runCheck(check) {
  const result = spawnSync(check.command, check.args, {
    cwd: check.cwd,
    encoding: 'utf8',
    stdio: 'pipe',
  });

  if (result.status === 0) {
    console.log(`✅ ${check.name}`);
    return true;
  }

  console.error(`❌ ${check.name}`);
  if (result.stdout) console.error(result.stdout);
  if (result.stderr) console.error(result.stderr);
  return false;
}

console.log('AOM Legacy monorepo health check\n');

let failed = 0;

for (const file of requiredFiles) {
  const path = join(root, file);
  if (existsSync(path)) {
    console.log(`✅ required file: ${file}`);
  } else {
    console.error(`❌ missing required file: ${file}`);
    failed += 1;
  }
}

for (const check of checks) {
  if (!runCheck(check)) {
    failed += 1;
  }
}

async function checkLiveApi() {
  const apiBase =
    process.env.HEALTH_CHECK_API_URL?.replace(/\/$/, '') ??
    'http://localhost:3001/api';

  try {
    const response = await fetch(`${apiBase}/health`);
    if (!response.ok) {
      console.error(`❌ live api health (${apiBase}/health) status ${response.status}`);
      return false;
    }

    const payload = await response.json();
    if (payload.status !== 'ok' && payload.status !== 'degraded') {
      console.error(`❌ live api health unexpected payload: ${JSON.stringify(payload)}`);
      return false;
    }

    console.log(`✅ live api health (${apiBase}/health)`);
    return true;
  } catch (error) {
    console.warn(
      `⚠️ live api health skipped (${apiBase}/health): ${
        error instanceof Error ? error.message : 'unreachable'
      }`,
    );
    return true;
  }
}

if (!(await checkLiveApi())) {
  failed += 1;
}

console.log('');
if (failed > 0) {
  console.error(`Health check failed with ${failed} issue(s).`);
  process.exit(1);
}

console.log('All health checks passed.');
