# Quickstart — Theme, Component Base & First-Launch Identity Flow

## Prerequisites

- [Phase 0 walking skeleton](../001-phase-0-walking-skeleton/quickstart.md) already runnable
  (`mobile/` installs and starts under Expo).
- **Expo Go keeps working for this feature** — verified against Expo's SDK 57 reference: Reanimated,
  Gesture Handler, `react-native-svg`, `expo-blur`, `expo-linear-gradient`, and
  `@react-native-async-storage/async-storage` are all officially "Included in Expo Go." No
  dev-client build is required (an earlier draft of this doc wrongly said otherwise).

## Install the new dependencies

```bash
cd mobile
npx expo install expo-router react-native-reanimated react-native-worklets \
  react-native-gesture-handler expo-linear-gradient expo-blur react-native-svg \
  expo-font expo-splash-screen @expo-google-fonts/urbanist \
  @react-native-async-storage/async-storage
npm install zustand nativewind tailwindcss lucide-react-native
```

(`react-native-worklets` is Reanimated 4's split-out peer package — required alongside
`react-native-reanimated` per its current install instructions.)

Register any package that ships a config plugin in `mobile/app.json`'s `"plugins"` array (check
each package's own setup docs — don't hand-edit native project files, this app has none checked
in).

### NativeWind setup

Follow NativeWind's current Expo setup guide (`tailwind.config.js` content-globs + VieGo theme
extension, `global.css` entrypoint, `babel.config.js` preset, `metro.config.js` wrapper) — check
NativeWind's own docs at implementation time rather than copying a possibly-stale snippet here,
since exact config shape drifts across versions.

### React Native Reusables components

Add components via RNR's own CLI installer (see reactnativereusables.com/docs/installation for the
current command and `components.json`-equivalent config) targeting `mobile/app/shared/ui/` as the
destination, so components land in the existing project convention rather than a separate
`components/ui` folder. Pull in: `switch`, `radio-group`, `progress`, `avatar`, `separator`,
`toggle`/`toggle-group`, `tabs` (for SegmentedControl) — per
[contracts/component-contracts.md](contracts/component-contracts.md) — then restyle each to the
VieGo Tailwind theme (crimson/gold palette, pill radii, Urbanist, `shadow.glow`) to match
`prototype/VieGo.dc.html` exactly. Components with no `@rn-primitives` equivalent (Button, Input,
Card, Divider-as-plain-rule, StatTile, StreakBadge, BottomTabBar, ScreenHeader, BottomSheet) are
hand-built directly on NativeWind-styled RN views.

## Run it

```bash
npx expo start
```

Scan the QR code with Expo Go (iOS/Android) — no dev-client build needed for this feature.

## Try the flow (manual smoke test)

1. Fresh install (clear Expo Go's cache for this project / reload with cache cleared) → Language
   Select appears, pre-selected to device locale or English.
2. Pick a language, Continue → Log in screen, in the picked language.
3. Tap "Create account" → Register → fill name/email/password → Create account.
4. Onboarding appears (3 slides, Skip pill top-right per the prototype) → finish or Skip.
5. Land on the blank main placeholder screen, themed (light/dark matches device setting).
6. Force-quit and relaunch the app → skip straight back to the placeholder screen (FR-033).
7. Toggle the device's system light/dark setting → relaunch → theme follows it (FR-005/SC-006).
8. Toggle the device's reduced-motion accessibility setting → onboarding transitions become instant
   (FR-036).

## Where things live

```
mobile/tailwind.config.js       # NativeWind theme = VieGo tokens (colors/radius/spacing/font)
mobile/global.css               # NativeWind Tailwind entrypoint

mobile/app/                     # Expo Router file-based routes (this feature migrates onto it)
├── (auth)/
│   ├── language.tsx
│   ├── login.tsx
│   ├── register.tsx
│   └── onboarding.tsx
├── main.tsx                    # blank placeholder landing screen
└── _layout.tsx                 # root layout: theme/i18n/session providers, routing guard

mobile/app/shared/
├── theme/                      # tokens.ts (extended to full token set) + ThemeProvider
├── i18n/                       # translations.ts (extended) + I18nProvider
├── ui/                         # component base — NativeWind-styled, RNR/@rn-primitives-sourced
│                                 where applicable (Button, Input, Card, Chip, ... — research.md R1)
├── mock/                       # explorerRepository.ts — mock account/session data (research.md R9)
└── store/                      # Zustand stores: theme, language, session (research.md R3)
```
