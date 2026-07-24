import { API_BASE_URL } from './config';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './authTokenStore';

/** Matches contracts/platform.openapi.yaml #/components/schemas/Status */
export interface Status {
  status: 'UP' | 'DOWN';
  service: string;
  version?: string;
  time: string;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT';
  body?: unknown;
  /** Attach the access token and retry once on 401 via refresh. Default true. */
  authenticated?: boolean;
}

function rawFetch(path: string, init: RequestInit): Promise<Response> {
  return fetch(`${API_BASE_URL}${path}`, init);
}

// A single in-flight refresh is shared by every caller that hits 401 at the same time, so a
// burst of concurrent requests doesn't rotate the refresh token more than once.
let refreshPromise: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return false;

  const res = await rawFetch('/auth/refresh', {
    method: 'POST',
    headers: { Authorization: `Bearer ${refreshToken}` },
  });
  if (!res.ok) {
    await clearTokens();
    return false;
  }
  const session = (await res.json()) as { accessToken: string; refreshToken: string };
  await setTokens(session.accessToken, session.refreshToken);
  return true;
}

function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function send(path: string, method: string, headers: Record<string, string>, body?: unknown): Promise<Response> {
  return rawFetch(path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, authenticated = true } = options;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (authenticated) {
    const token = await getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res = await send(path, method, headers, body);

  // Token refresh is transparent to callers — it lives here in the fetch interceptor, not a
  // hook, so it runs outside any component's lifecycle (per plan.md's mobile convention).
  if (res.status === 401 && authenticated) {
    const refreshed = await refreshSession();
    if (refreshed) {
      const token = await getAccessToken();
      if (token) headers.Authorization = `Bearer ${token}`;
      res = await send(path, method, headers, body);
    }
  }

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  if (res.status === 202 || res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}

export function apiGet<T>(path: string, authenticated = true): Promise<T> {
  return apiRequest<T>(path, { method: 'GET', authenticated });
}

export function apiPost<T>(path: string, body?: unknown, authenticated = true): Promise<T> {
  return apiRequest<T>(path, { method: 'POST', body, authenticated });
}

export function apiPut<T>(path: string, body?: unknown, authenticated = true): Promise<T> {
  return apiRequest<T>(path, { method: 'PUT', body, authenticated });
}

/** The walking-skeleton connectivity check (operationId getStatus) — unauthenticated. */
export function getStatus(): Promise<Status> {
  return apiGet<Status>('/status', false);
}
