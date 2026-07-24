import '../global.css';

import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useFonts,
  Urbanist_400Regular,
  Urbanist_500Medium,
  Urbanist_600SemiBold,
  Urbanist_700Bold,
  Urbanist_800ExtraBold,
} from '@expo-google-fonts/urbanist';

import { ThemeProvider } from './shared/theme/ThemeProvider';
import { I18nProvider } from './shared/i18n/I18nProvider';
import { useThemeStore } from './shared/store/themeStore';
import { useLanguageStore } from './shared/store/languageStore';
import { useSessionStore } from './shared/store/sessionStore';
import { resolveRoute } from './shared/lib/routing';

// Keep the splash visible until fonts + persisted stores are ready (research.md R5).
SplashScreen.preventAutoHideAsync().catch(() => {});

// One QueryClient for the app's lifetime — owns caching/invalidation for all server state
// (identity, and later modules), per mobile/CLAUDE.md's Zustand-for-client/Query-for-server split.
const queryClient = new QueryClient();

/** True once all three persisted Zustand stores have rehydrated from AsyncStorage. */
function useStoresHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const check = () => {
      if (
        useThemeStore.persist.hasHydrated() &&
        useLanguageStore.persist.hasHydrated() &&
        useSessionStore.persist.hasHydrated()
      ) {
        setHydrated(true);
      }
    };
    const unsubs = [
      useThemeStore.persist.onFinishHydration(check),
      useLanguageStore.persist.onFinishHydration(check),
      useSessionStore.persist.onFinishHydration(check),
    ];
    check();
    return () => unsubs.forEach((u) => u());
  }, []);

  return hydrated;
}

/**
 * The routing guard from data-model.md's state-transition diagram (T017), the core of the R2
 * Expo Router migration: no chosen language → Language Select; signed-out → Log in ⇄ Register;
 * signed-in but onboarding incomplete → resume Onboarding (guards the backgrounded-mid-onboarding
 * edge case, US2 scenario 4); signed-in + onboarding complete → blank main placeholder (FR-033).
 */
export function RoutingGuard() {
  const segments = useSegments();
  const router = useRouter();
  const hasChosenLanguage = useLanguageStore((s) => s.hasChosen);
  const status = useSessionStore((s) => s.status);
  const onboardingCompletedAt = useSessionStore((s) => s.onboardingCompletedAt);

  useEffect(() => {
    const target = resolveRoute({
      hasChosenLanguage,
      status,
      onboardingCompletedAt,
      leaf: segments[segments.length - 1],
    });
    if (target) router.replace(target);
  }, [segments, hasChosenLanguage, status, onboardingCompletedAt, router]);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Urbanist_400Regular,
    Urbanist_500Medium,
    Urbanist_600SemiBold,
    Urbanist_700Bold,
    Urbanist_800ExtraBold,
  });
  const storesHydrated = useStoresHydrated();
  const ready = fontsLoaded && storesHydrated;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null; // splash stays up

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <ThemeProvider>
            <I18nProvider>
              <RoutingGuard />
              <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
            </I18nProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
