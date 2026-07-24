import { Platform } from 'react-native';

/**
 * API base URL per environment. The dev slice (US1) points at the deployed dev backend;
 * locally, Android emulators reach the host via 10.0.2.2, iOS simulators via localhost.
 */
const LOCAL_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? `http://${LOCAL_HOST}:8080/api/v1`;

/**
 * Google OAuth client id for `expo-auth-session`'s Google ID-token request (research R6). Must
 * match a client registered for this app's redirect (`viego://`) in Google Cloud Console — a
 * dev/test-only client id is fine locally, same convention as the backend's
 * `GOOGLE_OAUTH_CLIENT_ID`.
 */
export const GOOGLE_OAUTH_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID ?? '';
