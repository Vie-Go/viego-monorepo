/**
 * VieGo design tokens (from DESIGN.md / PRODUCT.md brand commitments).
 * Light + dark palettes; the ThemeProvider exposes the active one.
 */
export const palette = {
  crimson: '#BE382A',
  gold: '#F2B72F',
  canvas: '#EBE5DC',
  canvasSoft: '#F6F3EE',
  ink: '#151011',
  white: '#FFFFFF',
} as const;

export type ThemeName = 'light' | 'dark';

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
  background: palette.canvasSoft,
  surface: palette.white,
  text: palette.ink,
  textMuted: '#5B5350',
  primary: palette.crimson,
  accent: palette.gold,
  border: '#E0D8CD',
};

export const darkTheme: Theme = {
  name: 'dark',
  background: palette.ink,
  surface: '#211A1B',
  text: palette.canvasSoft,
  textMuted: '#A79E9A',
  primary: palette.crimson,
  accent: palette.gold,
  border: '#33292A',
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
export const radius = { sm: 8, md: 12, lg: 20 } as const;
