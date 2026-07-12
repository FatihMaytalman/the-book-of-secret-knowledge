function trimTrailingSlash(url: string): string {
  return url.replace(/\/$/, '');
}

export function requireApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!raw) {
    throw new Error(
      'NEXT_PUBLIC_API_BASE_URL is required. Set it to your API base URL (e.g. http://localhost:3001/api for local dev, or https://api.example.com/api in production).',
    );
  }
  return trimTrailingSlash(raw);
}

/** Public site origin for invite links and absolute URLs in the browser. */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    return trimTrailingSlash(fromEnv);
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return '';
}
