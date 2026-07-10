const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ??
  'http://localhost:8080/api';

export interface HealthResponse {
  status: string;
  service: string;
  database?: string;
  ai?: string;
  timestamp: string;
}

export interface AiHealthResponse {
  status: 'ok' | 'unconfigured' | 'error';
  provider: 'anthropic';
  model: string;
  message: string;
}

export interface PlatformHealth {
  api: HealthResponse | null;
  ai: AiHealthResponse | null;
  checkedAt: string;
}

async function fetchJson<T>(path: string, revalidateSeconds = 30): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    next: { revalidate: revalidateSeconds },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchApiHealth(): Promise<HealthResponse> {
  return fetchJson<HealthResponse>('/health');
}

export async function fetchAiHealth(): Promise<AiHealthResponse> {
  return fetchJson<AiHealthResponse>('/ai/health');
}

export async function fetchPlatformHealth(): Promise<PlatformHealth> {
  const checkedAt = new Date().toISOString();

  const [apiResult, aiResult] = await Promise.allSettled([
    fetchApiHealth(),
    fetchAiHealth(),
  ]);

  return {
    api: apiResult.status === 'fulfilled' ? apiResult.value : null,
    ai: aiResult.status === 'fulfilled' ? aiResult.value : null,
    checkedAt,
  };
}

export { apiBaseUrl };
