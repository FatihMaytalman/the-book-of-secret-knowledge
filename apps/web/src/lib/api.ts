import type { FamilySummary, PersonSummary, PersonVisibility } from '@aomlegacy/shared';

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ??
  'http://localhost:8080/api';

export interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
}

export const TOKEN_KEY = 'kinvault.token';
export const USER_KEY = 'kinvault.user';

export interface AuthUser {
  userId: string;
  email: string;
  displayName: string;
}

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
}

function authHeader(): Record<string, string> {
  if (typeof window === 'undefined') {
    return {};
  }
  const token = window.localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(
  path: string,
  init?: RequestInit,
  token?: string,
): Promise<T> {
  const bearer = token ? { Authorization: `Bearer ${token}` } : authHeader();
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...bearer, ...init?.headers },
  });

  if (!response.ok) {
    let detail = '';
    try {
      const body = (await response.json()) as { message?: string | string[] };
      detail = Array.isArray(body.message)
        ? body.message.join(', ')
        : (body.message ?? '');
    } catch {
      // response had no JSON body
    }
    throw new Error(
      `Request to ${path} failed with status ${response.status}${detail ? `: ${detail}` : ''}`,
    );
  }

  return response.json() as Promise<T>;
}

export async function fetchApiHealth(): Promise<HealthResponse> {
  return request<HealthResponse>('/health');
}

export async function login(email: string, password: string): Promise<AuthSession> {
  return request<AuthSession>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(
  email: string,
  displayName: string,
  password: string,
): Promise<AuthSession> {
  return request<AuthSession>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, displayName, password }),
  });
}

export async function fetchFamilies(): Promise<FamilySummary[]> {
  return request<FamilySummary[]>('/families', { cache: 'no-store' });
}

export async function fetchFamily(id: string, token?: string): Promise<FamilySummary> {
  return request<FamilySummary>(`/families/${id}`, { cache: 'no-store' }, token);
}

export async function createFamily(name: string): Promise<FamilySummary> {
  return request<FamilySummary>('/families', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function fetchPeople(
  familyId: string,
  token?: string,
): Promise<PersonSummary[]> {
  return request<PersonSummary[]>(
    `/people?familyId=${encodeURIComponent(familyId)}`,
    { cache: 'no-store' },
    token,
  );
}

export async function fetchPerson(id: string, token?: string): Promise<PersonSummary> {
  return request<PersonSummary>(`/people/${id}`, { cache: 'no-store' }, token);
}

export interface CreatePersonInput {
  familyId: string;
  displayName: string;
  birthDate?: string | undefined;
  deathDate?: string | undefined;
  visibility?: PersonVisibility | undefined;
}

export async function createPerson(
  input: CreatePersonInput,
): Promise<PersonSummary> {
  return request<PersonSummary>('/people', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export { apiBaseUrl };
