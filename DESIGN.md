---
name: Vibeat
description: Gamified Vietnam cultural exploration map & heritage journal
colors:
  primary: "#BE382A"
  primary-hover: "#93271D"
  gold: "#F2B72F"
  neutral-bg: "#FFFFFF"
  neutral-surface: "#F6F3EE"
  neutral-card: "#FFFFFF"
  neutral-text: "#0C0507"
  neutral-sub: "#7A716B"
  neutral-line: "#ECE7E0"
  dark-bg: "#151011"
  dark-surface: "#221A1B"
  dark-card: "#251C1D"
  dark-text: "#F8F3EC"
  dark-sub: "#A79C97"
  dark-line: "#342B2C"
typography:
  display:
    fontFamily: "'Urbanist', sans-serif"
    fontSize: "30px"
    fontWeight: 800
    letterSpacing: "-0.5px"
    lineHeight: 1.15
  headline:
    fontFamily: "'Urbanist', sans-serif"
    fontSize: "26px"
    fontWeight: 800
    lineHeight: 1.2
  title:
    fontFamily: "'Urbanist', sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "'Urbanist', sans-serif"
    fontSize: "14.5px"
    fontWeight: 600
    lineHeight: 1.4
  label:
    fontFamily: "'Urbanist', sans-serif"
    fontSize: "12px"
    fontWeight: 700
    letterSpacing: "0.02em"
rounded:
  sm: "12px"
  md: "16px"
  full: "27px"
  pill: "9999px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.full}"
    height: "54px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  input-field:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.neutral-text}"
    rounded: "{rounded.md}"
    height: "52px"
    padding: "0 18px"
  card-container:
    backgroundColor: "{colors.neutral-card}"
    rounded: "{rounded.md}"
---

# Design System: Vibeat

## Overview

**Creative North Star: "The Crimson Heritage Map"**

Vibeat is a vibrant, tactile mobile journal celebrating Vietnam's cultural treasures. Built around an interactive SVG map of Vietnam's 63/64 provinces and archipelagos, the interface pairs deep heritage crimson (`#BE382A`) with warm golden accents (`#F2B72F`) and soft organic surfaces (`#F6F3EE`). 

The atmosphere balances cultural pride with modern mobile ergonomics. Friendly rounded forms (16px cards, 27px pill buttons) invite touch, while purposeful micro-animations give every province unlock, streak bump, and tab switch a tactile physical feedback.

**Key Characteristics:**
- **Crimson & Gold Anchor:** Primary CTA red (`#BE382A`) paired with glowing heritage yellow (`#F2B72F`) for streaks and unlocked territory.
- **Organic Tactility:** Softly rounded corners (16px cards, 27px full pill CTA buttons) and subtle ambient drop shadows.
- **Mobile-First Rhythm:** Compact, single-handed viewport layout optimized for touch interaction and quick scanning.
- **Dual Mode Harmony:** Seamless transition between warm off-white daylight mode (`#EBE5DC` canvas) and rich dark mode (`#151011` canvas).

## Colors

Vibeat's color identity relies on a bold primary crimson accent, energetic golden heritage highlights, and warm organic neutral surfaces.

### Primary
- **Heritage Crimson** (`#BE382A`): Primary brand identifier used for main call-to-action buttons, key links, active progress indicators, and high-impact actions.
- **Crimson Deep** (`#93271D`): Hover and pressed state for primary crimson CTAs.

### Secondary
- **Golden Vibe** (`#F2B72F`): Secondary accent used for daily streak badges, pulse animations, unlocked map fills (`#F3D89F` / `#7A5A20`), and achievement stars.

### Neutral
- **Canvas Sand** (`#EBE5DC`): Outer background frame for light mode.
- **Surface Cream** (`#F6F3EE`): Card backings, input background fields, and soft containers in light theme.
- **Charcoal Text** (`#0C0507`): High-contrast primary body text and titles.
- **Muted Subtext** (`#7A716B`): Secondary labels, helper text, and inactive tab icons.
- **Soft Line Divider** (`#ECE7E0`): Subtle 1.5px borders separating form fields and list items.

### Dark Theme Neutrals
- **Obsidian Crimson Canvas** (`#151011`): Main background canvas for dark mode.
- **Dark Surface** (`#221A1B` / `#251C1D`): Card backings and modal dialogs in dark mode.
- **Cream Text** (`#F8F3EC`): High-contrast text in dark mode.
- **Dark Line Divider** (`#342B2C`): Subtle borders in dark mode.

### Named Rules
**The Single Accent Rule.** Crimson (`#BE382A`) is reserved for primary actions and active states. Golden accents (`#F2B72F`) highlight achievements and streaks. Never mix multiple accent colors on a single button or field.

## Typography

**Display Font:** Urbanist (with system sans-serif fallback)
**Body Font:** Urbanist (with system sans-serif fallback)

**Character:** Urbanist brings geometric clarity, friendly warmth, and high readability to mobile displays. Heavy weights (800 and 700) create bold, confident headers, while medium weights (600) maintain legibility at smaller text sizes.

### Hierarchy
- **Display** (800, 30px, 1.15 line-height, -0.5px letter-spacing): App brand title ("vibeat") and welcome greetings.
- **Headline** (800, 26px, 1.2 line-height): Screen titles and major modal headers ("Xin chào!", "Tạo tài khoản").
- **Title** (700, 18px, 1.3 line-height): Card headers, province names, and section titles.
- **Body** (600, 14.5px, 1.4 line-height): Form inputs, list items, description copy.
- **Label** (700, 12px, 0.02em letter-spacing): Micro-labels, sub-captions, tag text.

### Named Rules
**The Tight Geometry Rule.** All titles and brand marks use heavy weights (700-800) with slight negative letter-spacing (-0.5px) for a compact, modern typographic punch.

## Layout

Vibeat is structured around single-handed mobile viewports (typically 402px wide by 874px high in frame view).

- **Padding Rhythm:** 24px-26px horizontal padding on screen edges; 10px-16px gap between stacked cards and fields.
- **Container Structure:** Full-viewport screens with flexbox column flow (`display: flex; flex-direction: column`).
- **Interactive Map Container:** Central view dedicated to vector SVG map rendering with responsive aspect ratio scaling (`preserveAspectRatio="xMidYMid meet"`).

## Elevation & Depth

Vibeat uses ambient drop shadows and soft tonal card fills to create tactile depth without harsh outlines.

### Shadow Vocabulary
- **Card Ambient** (`box-shadow: 0 12px 32px rgba(12,5,7,0.12)` in light theme, `0 12px 32px rgba(0,0,0,0.5)` in dark theme): Used on main surface cards, navigation bars, and floating action sheets.
- **CTA Glow** (`box-shadow: 0 10px 24px rgba(190,56,42,0.35)`): Used exclusively on primary crimson call-to-action buttons to give them a glowing, elevated presence.

### Named Rules
**The Elevated Action Rule.** Only primary crimson actions carry glowing colored shadows (`0 10px 24px rgba(190,56,42,0.35)`). Secondary and container surfaces rest flat or use ambient dark diffusion.

## Shapes

Form language relies on friendly, curved organic shapes with smooth pill-style controls.

- **Cards & Inputs:** 16px border-radius (`rounded.md`) with 1.5px subtle border lines.
- **Primary Buttons:** 27px / 54px height full pill radius (`rounded.full`) for comfortable thumb tapping.
- **Avatars & Icons:** 50% circular clipping (`border-radius: 50%`).
- **Province Map Shapes:** Smooth vector paths with 0.7px-1.0px white stroke borders.

## Components

### Buttons
- **Shape:** Full pill shape (height 54px, border-radius 27px).
- **Primary:** Background `#BE382A`, text `#FFFFFF`, font-weight 700, font-size 16px, box-shadow `0 10px 24px rgba(190,56,42,0.35)`.
- **Hover / Active:** Background `#93271D`, slight scale press effect.

### Inputs / Fields
- **Style:** Height 52px, border-radius 16px, border `1.5px solid var(--ln)`, background `var(--sf)`, padding `0 18px`.
- **Typography:** Urbanist 14.5px, font-weight 600.
- **Focus State:** Outline none, border shift to primary crimson `#BE382A`.

### Navigation & Language Select Cards
- **Style:** Flexbox row, padding `13px 16px`, border-radius 16px, background `var(--sf)`, border `1.5px solid var(--ln)`.
- **Interactive State:** Border color shifts to primary crimson on selection.

### Map Viewer (`<vn-map>`)
- **Style:** Custom Web Component rendering interactive SVG paths for 63/64 provinces.
- **Unlocked Fill:** Warm golden tint `#F3D89F` (light) / `#7A5A20` (dark).
- **Interactive Hover:** Pointer cursor with smooth `0.3s` fill transition.

## Do's and Don't's

### Do:
- **Do** maintain exact 27px radius for primary CTA buttons.
- **Do** use Urbanist font family across all components with strict 800/700/600 weight hierarchy.
- **Do** include glowing primary shadow `0 10px 24px rgba(190,56,42,0.35)` on main action buttons.
- **Do** preserve dual-theme variable definitions (`--bg`, `--sf`, `--tx`, `--ln`, `--map-prov`).

### Don't:
- **Don't** use sharp 0px corners on interactive cards or buttons.
- **Don't** apply primary crimson glowing shadows to non-primary buttons or containers.
- **Don't** introduce cold blues or stark neon colors into Vibeat's warm cultural palette.
