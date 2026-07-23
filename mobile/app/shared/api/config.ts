import { Platform } from 'react-native';

/**
 * API base URL per environment. The dev slice (US1) points at the deployed dev backend;
 * locally, Android emulators reach the host via 10.0.2.2, iOS simulators via localhost.
 */
const LOCAL_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? `http://${LOCAL_HOST}:8080/api/v1`;
