#!/usr/bin/env node
import { execFileSync } from 'node:child_process';

const args = parseArgs(process.argv.slice(2));
const provider = args.provider ?? 'kimi';
const prompt = args.prompt ?? 'Review this change for correctness, security, missing tests, and architecture risks.';
const diff = args.diff ?? readDiff(args.base ?? 'origin/master');

if (!diff.trim()) {
  console.error('No diff content found. Pass --diff, stage changes, or set --base <ref>.');
  process.exit(1);
}

const messages = [
  {
    role: 'system',
    content:
      'You are a senior architecture, security, and code-review assistant for AOM Legacy Family Tree. Prioritize correctness, privacy, data safety, security, and tests. Be concise and actionable.',
  },
  {
    role: 'user',
    content: `${prompt}\n\nRepository diff:\n\n${truncate(diff, Number(args.maxChars ?? 120000))}`,
  },
];

if (provider === 'ollama') {
  await reviewWithOllama(messages, args);
} else if (provider === 'kimi') {
  await reviewWithKimi(messages, args);
} else {
  console.error(`Unsupported provider: ${provider}. Use "kimi" or "ollama".`);
  process.exit(1);
}

async function reviewWithKimi(messages, args) {
  const apiKey = process.env.MOONSHOT_API_KEY ?? process.env.KIMI_API_KEY;
  if (!apiKey) {
    console.error('Set MOONSHOT_API_KEY or KIMI_API_KEY to use Kimi.');
    process.exit(1);
  }

  const baseUrl = process.env.KIMI_BASE_URL ?? 'https://api.moonshot.ai/v1';
  const model = args.model ?? process.env.KIMI_MODEL ?? 'kimi-k2.6';
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: Number(args.temperature ?? 0.6),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Kimi request failed: ${response.status} ${body}`);
  }

  const json = await response.json();
  console.log(json.choices?.[0]?.message?.content ?? JSON.stringify(json, null, 2));
}

async function reviewWithOllama(messages, args) {
  const host = process.env.OLLAMA_HOST ?? 'http://127.0.0.1:11434';
  const model = args.model ?? process.env.OLLAMA_MODEL ?? 'qwen2.5-coder:7b';
  const response = await fetch(`${host}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Ollama request failed: ${response.status} ${body}`);
  }

  const json = await response.json();
  console.log(json.message?.content ?? JSON.stringify(json, null, 2));
}

function readDiff(base) {
  try {
    return execFileSync('git', ['diff', `${base}...HEAD`], {
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
    });
  } catch {
    return execFileSync('git', ['diff'], {
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
    });
  }
}

function parseArgs(values) {
  const parsed = {};
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (!value?.startsWith('--')) {
      continue;
    }

    const key = value.slice(2);
    const next = values[index + 1];
    if (!next || next.startsWith('--')) {
      parsed[key] = 'true';
      continue;
    }

    parsed[key] = next;
    index += 1;
  }

  return parsed;
}

function truncate(value, maxChars) {
  if (value.length <= maxChars) {
    return value;
  }

  return `${value.slice(0, maxChars)}\n\n[diff truncated to ${maxChars} characters]`;
}
