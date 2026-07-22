---
title: "Design System"
description: "Design tokens (color, type, spacing, radius), component rules, and the prototype→React Native translation layer."
---

# Design System

The single source of visual truth is [`DESIGN.md`](../../../../DESIGN.md) ("The Crimson
Heritage Map"). The interactive reference is [`prototype/`](../../../../prototype/) — a
Do-Component ("vibeat") build in HTML/CSS. This document encodes both as **React Native**
design tokens and component contracts. Every screen spec in [`screens/`](screens/) and every
component spec in [`components/`](components/) draws from the tokens below.

## Tokens

Encoded in `shared/theme` and consumed via `useTheme()` — light + dark. Values are lifted
verbatim from the prototype's CSS custom properties.

```ts
// shared/theme/tokens.ts
export const palette = {
  primary: '#BE382A', primaryHover: '#93271D', gold: '#F2B72F', goldDeep: '#C08A10',
  onGold: '#231A08',              // ink used on gold surfaces
  // heat ramp (province check-in density → map + legend)
  heat: ['#F6E3BC', '#F0CF8C', '#E9BA55', '#DE9B27', '#BE382A'],
};

export const light = {
  canvas: '#EBE5DC', bg: '#FFFFFF', surface: '#F6F3EE', card: '#FFFFFF',
  text: '#0C0507', sub: '#7A716B', line: '#ECE7E0',
  mapProvince: '#EFE7DB', mapStroke: '#FFFFFF', mapUnlocked: '#F3D89F', mapLabel: '#A79C97',
  navBg: 'rgba(255,255,255,0.94)', pill: '#0C0507', pillText: '#FFFFFF',
};

export const dark = {
  canvas: '#151011', bg: '#151011', surface: '#221A1B', card: '#251C1D',
  text: '#F8F3EC', sub: '#A79C97', line: '#342B2C',
  mapProvince: '#2C2324', mapStroke: '#151011', mapUnlocked: '#7A5A20', mapLabel: '#8A7C78',
  navBg: 'rgba(30,23,24,0.94)', pill: '#F8F3EC', pillText: '#151011',
};

export const radius = { sm: 12, md: 16, lg: 20, full: 27, pill: 9999 };
export const space  = { xs: 6, sm: 10, md: 16, lg: 24, xl: 40 };
export const font = {
  family: 'Urbanist',
  size:   { display: 30, headline: 26, title: 18, body: 14.5, label: 12 },
  weight: { heavy: '800', bold: '700', medium: '600' } as const,
};
export const shadow = {
  // ambient card elevation
  card:  { color: '#0C0507', opacity: 0.12, radius: 32, offset: { width: 0, height: 12 } },
  // crimson CTA glow — primary actions ONLY
  glow:  { color: '#BE382A', opacity: 0.35, radius: 24, offset: { width: 0, height: 10 } },
};
```

Fonts: **Urbanist** weights 800 / 700 / 600 (+400/500). Ship the `.ttf` files in
`assets/fonts` and load with `expo-font` — do **not** rely on a system fallback for headings.

## Prototype (HTML/CSS) → React Native translation layer

The prototype uses browser primitives that have no 1:1 in React Native. Apply these mappings
consistently; each screen/component spec assumes them.

| Prototype (CSS) | React Native | Notes |
|---|---|---|
| `box-shadow` (card / glow) | `shadowColor/Opacity/Radius/Offset` (iOS) + `elevation` (Android) | Wrap in a `<Shadow>` primitive so the token maps once. Android elevation can't tint colored glow — approximate the crimson CTA glow with a subtle `elevation:8` + the button's own crimson. |
| `background: linear-gradient(...)` | `expo-linear-gradient` `<LinearGradient>` | Onboarding scrim, milestone radial, POI hero overlay. |
| `background: radial-gradient(...)` | `react-native-svg` `<RadialGradient>` or a layered `LinearGradient` | Milestone screen. |
| `backdrop-filter: blur(16px)` (nav bar) | `expo-blur` `<BlurView intensity={…} tint={theme}>` | Floating bottom tab bar + map overlays. |
| `:hover` / `cursor:pointer` | `Pressable` with `pressed` style + `android_ripple` | No hover on mobile; use pressed scale `0.97` + opacity. |
| `overflow-y:auto` screen | `ScrollView` / `FlatList` | Use `FlatList` for feeds, search results, notifications. |
| `position:absolute;inset:0` screen | screen container `flex:1` inside the navigator | Screens are navigator routes, not stacked absolutes. |
| CSS `@keyframes` (`vbUp`, `vbPop`, `vbBeat`, `vbFall`, `vbSlideUp`, `vbPing`) | **Reanimated 3** worklets | See the [animation catalogue](#animation-catalogue). Gate every one on reduced motion. |
| `<vn-map>` web component | `react-native-svg` map component | Ported from `prototype/vn-map.js` + `assets/vietnam-map.svg`. See [map components](components/map.md). |
| `<v-icon name="…">` (iconsax) | `iconsax-react-native` (or bundled SVG set) painting `currentColor` | Keep the same icon names where possible. |
| `padding-top:88px` (status area) | `useSafeAreaInsets()` + `SafeAreaView` | Never hard-code the notch offset. |
| `input` focus border → crimson | `TextInput` `onFocus/onBlur` toggling border token | See [Input](components/core.md#input). |

## Component rules

- **Buttons** — full pill (height 54, radius 27). **Primary** crimson with the `shadow.glow`
  token; **Action** gold (`#F2B72F`, ink text `#231A08`) for streak/positive commits;
  **Ghost** 1.5px `line` border, no fill. Pressed: scale `0.97`. See
  [Button](components/core.md#button).
- **Inputs** — height 52, radius 16, 1.5px border, `surface` fill, 18px horizontal padding;
  focus shifts border to `primary`. See [Input](components/core.md#input).
- **Cards** — radius 16–22, `card` fill, `shadow.card` ambient elevation.
- **Chips** — height 34–36, pill radius; selected = `pill` fill + `pillText`, else `surface`
  fill + `sub` text + `line` border. See [Chip](components/core.md#chip).
- **Streak badge** — pill; active = gold-tint bg + `goldDeep` flame; broken = `surface` +
  muted. See [StreakBadge](components/core.md#streakbadge).
- **Map** — unlocked provinces use `mapUnlocked`; check-in density uses the `heat` ramp.
- **Bottom tab bar** — floating blurred pill with a raised crimson camera FAB. See
  [BottomTabBar](components/navigation.md#bottomtabbar).

## Animation catalogue

Port these prototype keyframes to Reanimated. **All are gated on
`useReducedMotion()`** — when reduced motion is on, snap to the end state (opacity 1, no
transform, no confetti, no pulse).

| Name | Prototype keyframe | Used by | Reanimated approach |
|---|---|---|---|
| Rise-in | `vbUp` (translateY 18→0, fade) | headings, sheet content | `FadeInDown` entering / `withTiming` |
| Fade-in | `vbFade` | screen enters | `FadeIn` entering |
| Pop | `vbPop` (scale 0.4→1.12→1) | check icon, milestone flame, capture card | `withSpring` |
| Beat pulse | `vbBeat` (scale 1↔1.35, 1.6s loop) | brand gold dot, streak flame | `withRepeat(withTiming)` |
| Confetti fall | `vbFall` (translateY + rotate) | milestone celebration | per-piece `withRepeat`, staggered delay |
| Sheet slide-up | `vbSlideUp` (translateY 110%→0) | province bottom sheet | gesture-driven `BottomSheet` |
| Ping | `vbPing` (scale + fade) | map pin emphasis | `withRepeat` |

## Rules

- Read tokens via `useTheme()` — **never** inline hex/spacing/type.
- Urbanist weights 800/700/600 per the type scale; titles carry `-0.3` to `-0.5` letter-spacing.
- Respect `prefers-reduced-motion` (`useReducedMotion()`) for every unlock/streak/celebration.
- Reserve the crimson glow (`shadow.glow`) for primary actions only.
- Reserve gold (`#F2B72F`) for streaks, achievements, and unlocked territory.
- Every touch target ≥ 44×44 px.
- Every screen must render correctly in **light + dark** and **vi + en** — the
  [localization](localization.md) rules are non-negotiable.
