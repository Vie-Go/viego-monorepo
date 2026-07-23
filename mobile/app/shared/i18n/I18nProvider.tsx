import React, { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { getLocales } from 'expo-localization';
import { Locale, translations, TranslationKey, SUPPORTED_LOCALES } from './translations';
import { useLanguageStore } from '../store/languageStore';

interface I18nContextValue {
  locale: Locale;
  /** True once the Explorer has explicitly confirmed a language (Continue on Language Select). */
  hasChosen: boolean;
  t: (key: TranslationKey) => string;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

/** Best-effort device-locale detection, falling back to English (FR-018). */
function detectDeviceLocale(): Locale {
  try {
    const codes = getLocales().map((l) => l.languageCode);
    const match = codes.find(
      (c): c is Locale => !!c && (SUPPORTED_LOCALES as string[]).includes(c),
    );
    return match ?? 'en';
  } catch {
    return 'en';
  }
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const code = useLanguageStore((s) => s.code);
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  // Pre-select the device locale when nothing is stored yet (FR-018). The row is only
  // *pre-selected*, not *chosen* — `source: 'device'` keeps the routing guard on Language Select
  // until the Explorer taps Continue.
  useEffect(() => {
    if (code === null) {
      setLanguage(detectDeviceLocale(), 'device');
    }
  }, [code, setLanguage]);

  const activeLocale: Locale = code ?? 'en';

  const t = useCallback(
    (key: TranslationKey) => translations[activeLocale][key],
    [activeLocale],
  );

  const setLocale = useCallback(
    (next: Locale) => setLanguage(next, 'explicit'),
    [setLanguage],
  );

  const hasChosen = useLanguageStore((s) => s.hasChosen);

  const value = useMemo<I18nContextValue>(
    () => ({ locale: activeLocale, hasChosen, t, setLocale }),
    [activeLocale, hasChosen, t, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within an I18nProvider');
  return ctx;
}
