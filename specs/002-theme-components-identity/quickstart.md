# Quickstart — Theme, Component Base & First-Launch Identity Flow

## Prerequisites

- [Phase 0 walking skeleton](../001-phase-0-walking-skeleton/quickstart.md) already runnable
  (`mobile/` installs and starts under Expo).
- From this feature onward, **Expo Go can no longer run the app** — Reanimated and Gesture Handler
  (research.md R6) are native-code packages. Use an `expo-dev-client` build instead (see
  [expo-dev-client](../../mobile/CLAUDE.md) guidance / the `expo:expo-dev-client` skill).

## Install the new dependencies

```bash
cd mobile
npx expo install expo-router react-native-reanimated react-native-gesture-handler \
  expo-linear-gradient expo-blur react-native-svg expo-font expo-splash-screen \
  @expo-google-fonts/urbanist @react-native-async-storage/async-storage
npm install zustand @expo/vector-icons
```

Register any package that ships a config plugin in `mobile/app.json`'s `"plugins"` array (check
each package's own setup docs — don't hand-edit native project files, this app has none checked
in).

## Build a dev client (Expo Go no longer works after the above)

```bash
npx expo run:ios
# or
npx expo run:android
```

(Or use EAS Build for a shareable dev client — see the `expo:eas-dev-client` guidance if building
for a device you don't have locally.)

## Run it

```bash
npx expo start --dev-client
```

## Try the flow (manual smoke test)

1. Fresh install (clear app data / uninstall+reinstall the dev client) → Language Select appears,
   pre-selected to device locale or English.
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
├── ui/                         # component base (Button, Input, Card, Chip, ... — research.md R1)
├── mock/                       # explorerRepository.ts — mock account/session data (research.md R9)
└── store/                      # Zustand stores: theme, language, session (research.md R3)
```
