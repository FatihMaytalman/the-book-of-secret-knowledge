import type { FamilySummary, PersonSummary, PersonVisibility } from '@aomlegacy/shared';

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ??
  'http://localhost:8080/api';

export interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
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

export async function fetchFamilies(): Promise<FamilySummary[]> {
  return request<FamilySummary[]>('/families', { cache: 'no-store' });
}

export async function fetchFamily(id: string): Promise<FamilySummary> {
  return request<FamilySummary>(`/families/${id}`, { cache: 'no-store' });
}

export async function createFamily(name: string): Promise<FamilySummary> {
  return request<FamilySummary>('/families', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function fetchPeople(familyId: string): Promise<PersonSummary[]> {
  return request<PersonSummary[]>(
    `/people?familyId=${encodeURIComponent(familyId)}`,
    { cache: 'no-store' },
  );
}

export async function fetchPerson(id: string): Promise<PersonSummary> {
  return request<PersonSummary>(`/people/${id}`, { cache: 'no-store' });
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
