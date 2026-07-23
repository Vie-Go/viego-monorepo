/* Jest setup — native-module mocks for the component/screen suites.
 * (RNTL v13 auto-registers its matchers; no extend-expect import needed.) */

// react-native-gesture-handler is mocked via <rootDir>/__mocks__/react-native-gesture-handler.js
// (the library's own jestSetup references an RN internal shim path that moved in RN 0.86).

// AsyncStorage — in-memory mock so Zustand persist + explorerRepository tests run without native.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Reanimated ships its own Jest mock; augment the few hooks it omits.
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.useReducedMotion = () => false;
  return Reanimated;
});

// expo-router: mock the navigation surface the screens use.
jest.mock('expo-router', () => ({
  router: { replace: jest.fn(), push: jest.fn(), back: jest.fn() },
  useRouter: () => ({ replace: jest.fn(), push: jest.fn(), back: jest.fn() }),
  Link: ({ children }) => children,
  Stack: Object.assign(() => null, { Screen: () => null }),
  SplashScreen: { preventAutoHideAsync: jest.fn(), hideAsync: jest.fn() },
}));

// expo-font: report fonts loaded immediately.
jest.mock('expo-font', () => ({
  useFonts: () => [true, null],
  isLoaded: () => true,
}));

// expo-splash-screen
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));
