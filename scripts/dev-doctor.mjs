#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const checks = [
  {
    name: 'Node.js',
    command: 'node',
    args: ['--version'],
    required: true,
  },
  {
    name: 'npm',
    command: 'npm',
    args: ['--version'],
    required: true,
  },
  {
    name: 'GitHub CLI',
    command: 'gh',
    args: ['--version'],
    required: false,
  },
  {
    name: 'Docker',
    command: 'docker',
    args: ['--version'],
    required: false,
  },
  {
    name: 'Docker Compose',
    command: 'docker',
    args: ['compose', 'version'],
    required: false,
  },
  {
    name: 'Ollama',
    command: 'ollama',
    args: ['--version'],
    required: false,
  },
];

let failedRequired = false;

console.log('AOM Legacy local acceleration doctor\n');

for (const check of checks) {
  const result = run(check.command, check.args);
  if (result.ok) {
    console.log(`OK   ${check.name}: ${firstLine(result.stdout)}`);
  } else {
    const level = check.required ? 'FAIL' : 'MISS';
    console.log(`${level} ${check.name}: ${result.message}`);
    failedRequired ||= check.required;
  }
}

console.log('\nRepository files');
reportFile('Self-hosted compose', 'infra/self-hosted/docker-compose.yml');
reportFile('Self-hosted env template', 'infra/self-hosted/.env.example');
reportFile('CI workflow', '.github/workflows/ci.yml');
reportFile('Dependabot config', '.github/dependabot.yml');
reportFile('Biome config', 'biome.json');

console.log('\nAI acceleration environment');
reportEnv('MOONSHOT_API_KEY', 'Kimi/Moonshot API access');
reportEnv('KIMI_MODEL', 'optional Kimi model override; default is kimi-k2.6');
reportEnv('OLLAMA_HOST', 'optional Ollama host; default is http://127.0.0.1:11434');
reportEnv('OLLAMA_MODEL', 'optional Ollama model override');

console.log('\nRecommended local commands');
console.log('  npm run lint && npm run test && npm run typecheck && npm run build');
console.log('  npm run ai:review:kimi -- --prompt "review the API auth plan"');
console.log('  npm run ai:review:ollama -- --prompt "review the staged diff"');
console.log('  npm run docker:selfhost:config');

if (failedRequired) {
  process.exitCode = 1;
}

function run(command, args) {
  try {
    const stdout = execFileSync(command, args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { ok: true, stdout };
  } catch (error) {
    return {
      ok: false,
      message:
        error && typeof error === 'object' && 'code' in error
          ? `not available (${error.code})`
          : 'not available',
    };
  }
}

function firstLine(value) {
  return value.trim().split('\n')[0] ?? 'available';
}

function reportFile(label, path) {
  console.log(`${existsSync(path) ? 'OK  ' : 'MISS'} ${label}: ${path}`);
}

function reportEnv(name, description) {
  console.log(`${process.env[name] ? 'OK  ' : 'MISS'} ${name}: ${description}`);
}
