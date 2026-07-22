import { API_BASE_URL } from './config';

/** Matches contracts/platform.openapi.yaml #/components/schemas/Status */
export interface Status {
  status: 'UP' | 'DOWN';
  service: string;
  version?: string;
  time: string;
}

/** Minimal typed fetch wrapper — the seam later phases extend (auth header, refresh, etc.). */
export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

/** The walking-skeleton connectivity check (operationId getStatus). */
export function getStatus(): Promise<Status> {
  return apiGet<Status>('/status');
}
