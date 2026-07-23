/**
 * VieGo design tokens — the full set, lifted verbatim from the prototype's CSS custom
 * properties (`prototype/VieGo.dc.html`) and design-system.md. Light + dark; the
 * ThemeProvider exposes the active colour object plus these shared scales.
 *
 * NativeWind's `tailwind.config.js` encodes the same values for className styling; this file
 * is the JS-side source for the cases NativeWind can't cover (shadow objects, gradient stops,
 * icon `color` props). Keep the two in sync — never inline a raw hex in a component.
 */

// Brand palette (theme-independent).
export const palette = {
  primary: '#BE382A',
  primaryHover: '#93271D',
  gold: '#F2B72F',
  goldDeep: '#C08A10',
  onGold: '#231A08',
  // heat ramp (province check-in density → map + legend, later features)
  heat: ['#F6E3BC', '#F0CF8C', '#E9BA55', '#DE9B27', '#BE382A'],
  // legacy aliases kept so pre-migration screens still compile
  crimson: '#BE382A',
  canvas: '#EBE5DC',
  canvasSoft: '#F6F3EE',
  ink: '#0C0507',
  white: '#FFFFFF',
} as const;

export type ThemeName = 'light' | 'dark';

/** Semantic colour surface for one theme. */
export interface ThemeColors {
  name: ThemeName;
  canvas: string;
  bg: string;
  surface: string;
  card: string;
  text: string;
  sub: string;
  line: string;
  mapProvince: string;
  mapStroke: string;
  mapUnlocked: string;
  mapLabel: string;
  navBg: string;
  pill: string;
  pillText: string;
}

export const lightColors: ThemeColors = {
  name: 'light',
  canvas: '#EBE5DC',
  bg: '#FFFFFF',
  surface: '#F6F3EE',
  card: '#FFFFFF',
  text: '#0C0507',
  sub: '#7A716B',
  line: '#ECE7E0',
  mapProvince: '#EFE7DB',
  mapStroke: '#FFFFFF',
  mapUnlocked: '#F3D89F',
  mapLabel: '#A79C97',
  navBg: 'rgba(255,255,255,0.94)',
  pill: '#0C0507',
  pillText: '#FFFFFF',
};

export const darkColors: ThemeColors = {
  name: 'dark',
  canvas: '#151011',
  bg: '#151011',
  surface: '#221A1B',
  card: '#251C1D',
  text: '#F8F3EC',
  sub: '#A79C97',
  line: '#342B2C',
  mapProvince: '#2C2324',
  mapStroke: '#151011',
  mapUnlocked: '#7A5A20',
  mapLabel: '#8A7C78',
  navBg: 'rgba(30,23,24,0.94)',
  pill: '#F8F3EC',
  pillText: '#151011',
};

export const radius = { sm: 12, md: 16, lg: 20, full: 27, pill: 9999 } as const;
export const space = { xs: 6, sm: 10, md: 16, lg: 24, xl: 40 } as const;

export const font = {
  family: 'Urbanist',
  faces: {
    regular: 'Urbanist_400Regular',
    medium: 'Urbanist_500Medium',
    semibold: 'Urbanist_600SemiBold',
    bold: 'Urbanist_700Bold',
    heavy: 'Urbanist_800ExtraBold',
  },
  size: { display: 30, headline: 26, title: 18, body: 14.5, label: 12 },
  weight: { heavy: '800', bold: '700', medium: '600' },
} as const;

export const shadow = {
  // ambient card elevation
  card: {
    shadowColor: '#0C0507',
    shadowOpacity: 0.12,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  // crimson CTA glow — primary actions ONLY
  glow: {
    shadowColor: '#BE382A',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
} as const;

/* ---------------------------------------------------------------------------
 * Backward-compatible exports for the pre-migration screens (app/screens/*,
 * app/shared/ui/index.tsx). These are dead under expo-router but must still compile.
 * ------------------------------------------------------------------------- */
export interface Theme {
  name: ThemeName;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  primary: string;
  accent: string;
  border: string;
}

export const lightTheme: Theme = {
  name: 'light',
  background: lightColors.surface,
  surface: lightColors.card,
  text: lightColors.text,
  textMuted: lightColors.sub,
  primary: palette.primary,
  accent: palette.gold,
  border: lightColors.line,
};

export const darkTheme: Theme = {
  name: 'dark',
  background: darkColors.bg,
  surface: darkColors.surface,
  text: darkColors.text,
  textMuted: darkColors.sub,
  primary: palette.primary,
  accent: palette.gold,
  border: darkColors.line,
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
