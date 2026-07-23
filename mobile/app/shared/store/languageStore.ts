/**
 * Persisted active language preference (FR-019; data-model.md Language Preference).
 *
 * `source` records whether the value was pre-selected from the device locale or explicitly
 * picked — it drives the pre-selected row on the Language Select screen (FR-018) and lets the
 * routing guard know whether a language was ever chosen (no stored language → Language Select).
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Locale } from '../i18n/translations';

export type LanguageSource = 'device' | 'explicit';

interface LanguageState {
  /** Active locale, or `null` until the Explorer has chosen (or device pre-selection ran). */
  code: Locale | null;
  source: LanguageSource;
  /** True once the Explorer has explicitly confirmed a language (Continue on Language Select). */
  hasChosen: boolean;
  /** Device pre-selection / generic set (also used by Profile's language switch later). */
  setLanguage: (code: Locale, source: LanguageSource) => void;
  /**
   * Change the *displayed* language without confirming — used while the Explorer taps rows on
   * Language Select so text updates live but the routing guard stays on the screen (hasChosen
   * remains false until Continue).
   */
  previewLanguage: (code: Locale) => void;
  /** Confirm the choice (Continue) — sets hasChosen, letting the routing guard advance. */
  confirmLanguage: (code: Locale) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      code: null,
      source: 'device',
      hasChosen: false,
      setLanguage: (code, source) =>
        set({ code, source, hasChosen: source === 'explicit' }),
      previewLanguage: (code) => set({ code }),
      confirmLanguage: (code) => set({ code, source: 'explicit', hasChosen: true }),
    }),
    {
      name: 'viego.language',
      storage: createJSONStorage(() => AsyncStorage),
      // `hasChosen` is the gate the routing guard reads; persist everything.
    },
  ),
);
