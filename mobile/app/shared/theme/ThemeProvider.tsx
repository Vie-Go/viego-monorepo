import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { colorScheme as nativewindColorScheme } from 'nativewind';
import {
  lightColors,
  darkColors,
  ThemeColors,
  ThemeName,
  palette,
  radius,
  space,
  font,
  shadow,
} from './tokens';
import { useThemeStore } from '../store/themeStore';

interface ThemeContextValue {
  theme: ThemeColors;
  themeName: ThemeName;
  // Shared scales, exposed for the cases NativeWind classNames can't reach (shadows, gradient
  // stops, icon color props).
  palette: typeof palette;
  radius: typeof radius;
  space: typeof space;
  font: typeof font;
  shadow: typeof shadow;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function resolveName(scheme: ColorSchemeName | null | undefined): ThemeName {
  return scheme === 'dark' ? 'dark' : 'light';
}

/**
 * Resolves the theme from the OS colour scheme (FR-003) and follows subsequent system changes
 * automatically (FR-005) — there is no in-app manual toggle in this feature. The resolved name is
 * persisted (FR-004) and pushed to NativeWind so `dark:` utility classes track the same source.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>(() =>
    resolveName(Appearance.getColorScheme()),
  );
  const setResolvedName = useThemeStore((s) => s.setResolvedName);

  useEffect(() => {
    // Keep NativeWind + the persisted store aligned with the current resolution.
    nativewindColorScheme.set(themeName);
    setResolvedName(themeName);
  }, [themeName, setResolvedName]);

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setThemeName(resolveName(colorScheme));
    });
    return () => sub.remove();
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      themeName,
      theme: themeName === 'dark' ? darkColors : lightColors,
      palette,
      radius,
      space,
      font,
      shadow,
    }),
    [themeName],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
