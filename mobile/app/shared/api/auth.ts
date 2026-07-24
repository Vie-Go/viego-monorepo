/**
 * Identity API calls (research.md; contracts/rest-api.identity.openapi.yaml) — plain typed
 * functions consumed as `queryFn`/`mutationFn`, the same pattern `client.ts`'s `getStatus` already
 * backs `ConnectivityCard`'s `useQuery`. Hooks live in the screens that call these, not here.
 */
import { API_BASE_URL } from './config';
import { apiGet, apiPost, apiPut } from './client';

export interface Preferences {
  language: 'vi' | 'en' | 'ko' | 'ja' | 'fr';
  theme: 'light' | 'dark';
}

export interface Explorer {
  id: string;
  handle: string;
  displayName: string;
  homeProvince: string | null;
  preferences: Preferences;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  explorer: Explorer;
}

/** `POST /auth/email/challenge` — sends a one-time code; not a session (R10). */
export function requestEmailChallenge(email: string): Promise<void> {
  return apiPost<void>('/auth/email/challenge', { email }, false);
}

/** `POST /auth/email` — completes sign-in with the code from {@link requestEmailChallenge}. */
export function signInWithEmailCode(email: string, code: string): Promise<Session> {
  return apiPost<Session>('/auth/email', { email, code }, false);
}

/** `POST /auth/google` — completes sign-in with a verified Google ID token. */
export function signInWithGoogle(idToken: string): Promise<Session> {
  return apiPost<Session>('/auth/google', { token: idToken }, false);
}

/**
 * `POST /auth/refresh` — rotates the given refresh token. Exposed here for direct testability
 * (T048); the actual transparent 401→refresh→retry path lives in `client.ts`'s fetch interceptor,
 * not a hook, since it must run outside any component's lifecycle.
 */
export async function refresh(refreshToken: string): Promise<Session> {
  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${refreshToken}` },
  });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return (await res.json()) as Session;
}

/** `GET /explorers/me` — the authenticated Explorer, `me`-scoped from the access token. */
export function getMe(): Promise<Explorer> {
  return apiGet<Explorer>('/explorers/me');
}

/** `PUT /explorers/me/preferences` — replaces language/theme wholesale. */
export function updatePreferences(preferences: Preferences): Promise<Preferences> {
  return apiPut<Preferences>('/explorers/me/preferences', preferences);
}
