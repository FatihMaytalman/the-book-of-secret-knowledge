const DEFAULT_CORS_ORIGINS =
  'https://bizimkiler.aomlegacy.com,*.vercel.app';

export function parseCorsOrigins(value?: string): string[] {
  return (value?.trim() || DEFAULT_CORS_ORIGINS)
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function isCorsOriginAllowed(origin: string, allowed: string[]): boolean {
  for (const pattern of allowed) {
    if (pattern === origin) {
      return true;
    }

    if (pattern.startsWith('*.')) {
      const suffix = pattern.slice(1);
      try {
        const { protocol, hostname } = new URL(origin);
        if (protocol !== 'https:') {
          continue;
        }
        if (hostname.endsWith(suffix) && hostname.length > suffix.length) {
          return true;
        }
      } catch {
        continue;
      }
    }
  }

  return false;
}
