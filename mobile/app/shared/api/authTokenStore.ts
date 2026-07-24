/**
 * On-device session token storage (research.md R7). Access + refresh JWTs go into
 * `expo-secure-store` (Keychain on iOS, Keystore-backed on Android) — never `AsyncStorage`, which
 * is unencrypted. `useSessionStore` keeps its own unrelated shape (explorerId/status/onboarding);
 * this module owns token bytes only.
 */
import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'viego.auth.accessToken';
const REFRESH_TOKEN_KEY = 'viego.auth.refreshToken';

export function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function setTokens(accessToken: string, refreshToken: string): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
  ]);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ]);
}
