import type { Database } from '../types';
import { emptyDb } from './storage';

const REQUIRED_ARRAYS = [
  'accounts',
  'families',
  'memberships',
  'invites',
  'people',
  'events',
  'relationships',
] as const;

export function exportDatabaseJson(db: Database): string {
  return JSON.stringify(
    { app: 'familychain', version: 1, exportedAt: new Date().toISOString(), data: db },
    null,
    2,
  );
}

export function parseDatabaseJson(text: string): Database {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('That file is not valid JSON.');
  }
  const container = parsed as { data?: unknown } | null;
  const data = (container && typeof container === 'object' && 'data' in container
    ? container.data
    : parsed) as Record<string, unknown> | null;

  if (
    !data ||
    typeof data !== 'object' ||
    !REQUIRED_ARRAYS.every((key) => Array.isArray((data as Record<string, unknown>)[key]))
  ) {
    throw new Error('That file is not a FamilyChain backup.');
  }
  return { ...emptyDb(), ...(data as Partial<Database>), version: 1 };
}

export function downloadText(
  filename: string,
  text: string,
  mime = 'application/json',
): void {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
