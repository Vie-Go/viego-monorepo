/**
 * Persisted resolved theme name (research.md R3; data-model.md Theme).
 *
 * The theme is re-derived from `Appearance.getColorScheme()` on every cold launch (FR-003/005),
 * but the last-resolved name is still persisted (FR-004) so the storage shape is ready for the
 * future manual toggle (deferred to Profile & Preferences) without a later migration.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemeName } from '../theme/tokens';

interface ThemeState {
  /** Last resolved theme name; `null` until the first resolution. */
  resolvedName: ThemeName | null;
  setResolvedName: (name: ThemeName) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      resolvedName: null,
      setResolvedName: (name) => set({ resolvedName: name }),
    }),
    {
      name: 'viego.theme',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
