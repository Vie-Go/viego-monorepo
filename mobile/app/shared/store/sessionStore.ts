/**
 * Persisted mock session (FR-033; data-model.md Session).
 *
 * Drives the routing guard: signed-out → Language/Log in stack; signed-in + onboarding
 * complete → blank main placeholder; signed-in without completed onboarding → resume Onboarding
 * (guards the backgrounded-mid-onboarding edge case). No backend token — this is mock/local only
 * (FR-020); a later feature swaps the mock repository's internals for real auth without changing
 * this store's shape.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SessionStatus = 'signed-out' | 'signed-in';

interface SessionState {
  explorerId: string | null;
  status: SessionStatus;
  onboardingCompletedAt: string | null;
  /** Establish a signed-in session (after successful register/login). */
  signIn: (explorerId: string) => void;
  signOut: () => void;
  /** Mark onboarding finished (final slide confirmed or Skip — R10). */
  completeOnboarding: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      explorerId: null,
      status: 'signed-out',
      onboardingCompletedAt: null,
      signIn: (explorerId) => set({ explorerId, status: 'signed-in' }),
      signOut: () =>
        set({ explorerId: null, status: 'signed-out', onboardingCompletedAt: null }),
      completeOnboarding: () =>
        set({ onboardingCompletedAt: new Date().toISOString() }),
    }),
    {
      name: 'viego.session',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
