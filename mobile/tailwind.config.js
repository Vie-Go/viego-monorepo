/**
 * VieGo Tailwind theme for NativeWind v4 (research.md R1).
 * Tokens lifted verbatim from design-system.md / prototype/VieGo.dc.html CSS custom
 * properties. Light values are the defaults; the `dark:` variant maps to the prototype's
 * `.vbapp[data-vtheme="dark"]` palette. Never inline hex/spacing in a component — reach for
 * these class names so the design system maps once.
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand
        crimson: '#BE382A',
        'crimson-hover': '#93271D',
        gold: '#F2B72F',
        'gold-deep': '#C08A10',
        'on-gold': '#231A08',
        // Semantic — light (defaults) / dark (via dark: variant classes)
        canvas: { DEFAULT: '#EBE5DC', dark: '#151011' },
        bg: { DEFAULT: '#FFFFFF', dark: '#151011' },
        surface: { DEFAULT: '#F6F3EE', dark: '#221A1B' },
        card: { DEFAULT: '#FFFFFF', dark: '#251C1D' },
        ink: { DEFAULT: '#0C0507', dark: '#F8F3EC' },
        sub: { DEFAULT: '#7A716B', dark: '#A79C97' },
        line: { DEFAULT: '#ECE7E0', dark: '#342B2C' },
        pill: { DEFAULT: '#0C0507', dark: '#F8F3EC' },
        'pill-text': { DEFAULT: '#FFFFFF', dark: '#151011' },
        // Heat ramp (province check-in density) — for later map features
        'heat-1': '#F6E3BC',
        'heat-2': '#F0CF8C',
        'heat-3': '#E9BA55',
        'heat-4': '#DE9B27',
        'heat-5': '#BE382A',
      },
      borderRadius: {
        sm: '12px',
        md: '16px',
        lg: '20px',
        full: '27px',
        pill: '9999px',
      },
      spacing: {
        xs: '6px',
        sm: '10px',
        md: '16px',
        lg: '24px',
        xl: '40px',
      },
      fontFamily: {
        // Weight-specific Urbanist faces loaded via @expo-google-fonts/urbanist (T016).
        sans: ['Urbanist_600SemiBold'],
        urbanist: ['Urbanist_400Regular'],
        'urbanist-medium': ['Urbanist_500Medium'],
        'urbanist-semibold': ['Urbanist_600SemiBold'],
        'urbanist-bold': ['Urbanist_700Bold'],
        'urbanist-heavy': ['Urbanist_800ExtraBold'],
      },
      fontSize: {
        label: '12px',
        body: '14.5px',
        title: '18px',
        headline: '26px',
        display: '30px',
      },
      boxShadow: {
        // ambient card elevation
        card: '0px 12px 32px rgba(12,5,7,0.12)',
        // crimson CTA glow — primary actions ONLY
        glow: '0px 10px 24px rgba(190,56,42,0.35)',
      },
    },
  },
  plugins: [],
};
