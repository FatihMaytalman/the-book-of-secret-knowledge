import type { Database } from '../types';

const DB_KEY = 'familychain.db.v1';
const SESSION_KEY = 'familychain.session';
const THEME_KEY = 'familychain.theme';

export type ThemePreference = 'light' | 'dark';

export function emptyDb(): Database {
  return {
    version: 1,
    accounts: [],
    families: [],
    memberships: [],
    invites: [],
    people: [],
    events: [],
    relationships: [],
  };
}

export function loadDb(): Database {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return emptyDb();
    const parsed = JSON.parse(raw) as Partial<Database>;
    return { ...emptyDb(), ...parsed };
  } catch {
    return emptyDb();
  }
}

export function saveDb(db: Database): void {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

export function loadSession(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

export function saveSession(accountId: string | null): void {
  if (accountId) {
    localStorage.setItem(SESSION_KEY, accountId);
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function loadTheme(): ThemePreference | null {
  const value = localStorage.getItem(THEME_KEY);
  return value === 'light' || value === 'dark' ? value : null;
}

export function saveTheme(theme: ThemePreference): void {
  localStorage.setItem(THEME_KEY, theme);
}

/** Rough byte size of the persisted database (used for quota warnings). */
export function estimateDbBytes(db: Database): number {
  try {
    return new Blob([JSON.stringify(db)]).size;
  } catch {
    return JSON.stringify(db).length;
  }
}

/** Typical localStorage cap is ~5MB per origin. */
export const STORAGE_SOFT_LIMIT_BYTES = 5 * 1024 * 1024;
