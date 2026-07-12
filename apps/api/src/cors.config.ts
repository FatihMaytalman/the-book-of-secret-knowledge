import type { FastifyCorsOptions } from '@fastify/cors';

export const DEFAULT_CORS_ORIGINS =
  'https://bizimkiler.aomlegacy.com,*.vercel.app';

export function parseCorsOrigins(value?: string): string[] {
  const raw = value?.trim() || DEFAULT_CORS_ORIGINS;
  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function hostnameFromOrigin(origin: string): string | null {
  try {
    return new URL(origin).hostname;
  } catch {
    return null;
  }
}

export function isOriginAllowed(origin: string, allowedPatterns: string[]): boolean {
  return allowedPatterns.some((pattern) => matchesOriginPattern(origin, pattern));
}

function matchesOriginPattern(origin: string, pattern: string): boolean {
  if (origin === pattern) {
    return true;
  }

  if (pattern.startsWith('*.')) {
    const suffix = pattern.slice(1);
    const hostname = hostnameFromOrigin(origin);
    if (!hostname) {
      return false;
    }
    return hostname.endsWith(suffix) && hostname.length > suffix.length;
  }

  return false;
}

export function buildCorsOptions(corsOriginsEnv?: string): FastifyCorsOptions {
  const allowedPatterns = parseCorsOrigins(corsOriginsEnv);

  return {
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (isOriginAllowed(origin, allowedPatterns)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS`), false);
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
}
