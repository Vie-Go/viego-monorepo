# Handoff — US1: Explorer picks their language

**Story**: A person opens the app for the first time and picks their interface language before
anything else happens. **Priority**: P1 (MVP). **Status**: ✅ Complete, unit-tested (green).

**Date**: 2026-07-23 · **Branch**: `002-theme-components-identity`

---

## What shipped

The **Language Select** screen — the first screen on a fresh install — plus the setup and
foundational layers it sits on. The R2 Expo Router migration is now live: the flow is driven by
file-based routes under `mobile/app/` with a routing guard, not the retired manual
`RootNavigator.tsx`.

### Tasks completed

| Phase | Tasks | Result |
|---|---|---|
| Setup (Phase 1) | T001–T007 | Deps, NativeWind/Tailwind theme, babel/metro/app.json wiring |
| Foundational (Phase 2) | T008–T024 | Tokens, providers, stores, i18n, mock repo, routing guard, 5 base components + tests |
| US1 (Phase 3) | T025–T029 | `SelectRow`, Language Select screen, store wiring, tests |

### Files of record

- **Screen**: [`mobile/app/(auth)/language.tsx`](../../mobile/app/(auth)/language.tsx)
- **Component**: [`mobile/app/shared/ui/SelectRow.tsx`](../../mobile/app/shared/ui/SelectRow.tsx)
  (radio-group role, prototype-exact chip/label/dot)
- **State**: [`mobile/app/shared/store/languageStore.ts`](../../mobile/app/shared/store/languageStore.ts)
  — added `previewLanguage` / `confirmLanguage` (see decision below)
- **Routing guard**: [`mobile/app/_layout.tsx`](../../mobile/app/_layout.tsx) `RoutingGuard`
- **Tests**: `__tests__/screens/language.test.tsx`, `__tests__/ui/SelectRow.test.tsx`

## Key decisions taken during implementation

1. **Preview vs. confirm split (languageStore).** The routing guard keys off `hasChosen`. If
   tapping a locale row set `hasChosen`, the guard would immediately navigate away from Language
   Select mid-pick. So picking a row calls **`previewLanguage(code)`** (updates displayed text
   live, `hasChosen` stays false) and **Continue** calls **`confirmLanguage(code)`** (sets
   `hasChosen`, guard advances to Log in). This satisfies FR-018's "immediate text update on pick"
   *and* "stay until Continue".
2. **Device-locale pre-selection** lives in `I18nProvider` (`source: 'device'`), so the row is
   pre-selected without counting as a choice. Fallback is English when the device locale isn't one
   of the 5 supported (FR-018).
3. **`(auth)/login` is the Continue target** and already exists as a stub (T018) — US1 is
   independently testable without US2/US3's real screens.

## How to verify US1 independently

```bash
cd mobile && npm test -- __tests__/screens/language.test.tsx __tests__/ui/SelectRow.test.tsx
```

Manual (Expo Go): fresh install → Language Select appears, one row pre-selected → pick another →
text updates live → Continue → Log in stub. (Clear the app's storage to re-trigger a "fresh
install".)

## ⚠️ Environment notes the next implementer must know

These bit me during setup and are **not** obvious from the spec:

- **Jest must be v29, not v30.** `jest-expo@57` depends on the jest-29 family (`@jest/globals@^29`,
  `babel-jest@^29`). Installing jest 30 produced cascading failures (`clearMocksOnScope is not a
  function`, expo "winter runtime" require-scope errors). `package.json` now pins `jest@^29.7.0` /
  `@types/jest@^29`.
- **Run tests via the local jest binary**, not bare `npx jest` — `npx` grabbed a stale cached jest
  without `babel-preset-expo`, breaking JSX parsing. Use `npm test` or
  `node ./node_modules/jest/bin/jest.js`.
- **`useReducedMotion` comes from `react-native-reanimated`**, not `react-native`, and the
  Reanimated jest mock omits it — `jest.setup.js` augments the mock (`useReducedMotion → false`).
- **`@react-native/jest-preset@^0.86.0`** is a required peer of `jest-expo@57` and must be a
  devDependency.
- **Dependency install uses `--legacy-peer-deps`.** Expo 57 / RN 0.86 is ahead of some packages'
  published peer ranges (e.g. Reanimated's peer caps at RN 0.82), so strict resolution / `expo
  install --fix` fail. This does not affect runtime.
- Test wrapper (`__tests__/testUtils.tsx`) provides SafeArea + Theme + I18n providers with fixed
  safe-area metrics — reuse `renderWithProviders` for any screen test.

## What US1 deliberately does NOT do

- No real Log in / Register / Onboarding screens (stubs only) — those are US2/US3.
- ko/ja/fr are selectable but fall back to English strings (spec Assumptions); only vi/en have full
  tables.
- No manual theme toggle (FR-005 — theme follows the OS only in this feature).

## Next: US2 (New Explorer completes first-launch setup)

Register → Onboarding → blank main placeholder. Build order per tasks.md: `ProgressBars` (T030) →
Register (T031–T032) → Onboarding (T033–T035, T037) → main placeholder (T036) → tests. US3 depends
on US2's `register()` path existing.
