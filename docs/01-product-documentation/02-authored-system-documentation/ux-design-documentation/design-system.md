---
title: "Design System"
description: "Design tokens (color, type, spacing, radius) and component rules, encoded for the app."
---

# Design System

The single source of visual truth is [`DESIGN.md`](../../../../../DESIGN.md). The app encodes it
as tokens in `shared/theme` and supports light + dark.

## Tokens
```ts
export const tokens = {
  color: {
    primary: '#BE382A', primaryHover: '#93271D', gold: '#F2B72F',
    // light
    bg: '#EBE5DC', surface: '#F6F3EE', card: '#FFFFFF',
    text: '#0C0507', sub: '#7A716B', line: '#ECE7E0', mapUnlocked: '#F3D89F',
  },
  radius: { sm: 12, md: 16, full: 27, pill: 9999 },
  space: { xs: 6, sm: 10, md: 16, lg: 24, xl: 40 },
  font: { family: 'Urbanist', display: 30, headline: 26, title: 18, body: 14.5, label: 12 },
};
```
Dark overrides: `bg #151011`, `surface #221A1B`, `card #251C1D`, `text #F8F3EC`, `sub #A79C97`,
`line #342B2C`, `mapUnlocked #7A5A20`.

## Component rules
- **Buttons:** full pill (height 54, radius 27); primary crimson with glow
  `0 10px 24px rgba(190,56,42,0.35)` (primary CTAs only).
- **Inputs:** height 52, radius 16, 1.5px border; focus shifts border to crimson.
- **Cards:** radius 16, ambient shadow.
- **Map:** unlocked provinces use the gold `mapUnlocked` fill.

## Rules
- Read tokens via `useTheme()` — **never** inline hex/spacing.
- Urbanist weights 800/700/600 per the type scale.
- Respect `prefers-reduced-motion` for unlock/streak animations.
- Reserve the crimson glow for primary actions only.
