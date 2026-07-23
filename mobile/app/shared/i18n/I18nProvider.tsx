import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Locale, translations, TranslationKey } from './translations';

interface I18nContextValue {
  locale: Locale;
  t: (key: TranslationKey) => string;
  toggleLocale: () => void;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('vi');

  const t = useCallback((key: TranslationKey) => translations[locale][key], [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      t,
      setLocale,
      toggleLocale: () => setLocale((l) => (l === 'vi' ? 'en' : 'vi')),
    }),
    [locale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within an I18nProvider');
  return ctx;
}
