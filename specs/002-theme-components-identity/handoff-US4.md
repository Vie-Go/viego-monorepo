# Handoff — US4: Every screen consistent, legible, and accessible

**Story**: The full component base foundation is complete (including components not wired into any
screen this feature), and every screen is verified consistent across theme, language, motion, and
assistive-technology settings. **Priority**: P3. **Status**: ✅ Complete (unit-tested); manual
device sweeps documented below.

**Date**: 2026-07-23 · **Branch**: `002-theme-components-identity`

---

## What shipped

The **remaining component base** — 12 components built-to-spec but unwired this feature (foundation
for later features) — plus the cross-cutting quality verification across all 5 screens, plus the
Phase 7 Maestro E2E flows.

### Tasks completed

| Group | Tasks | Deliverable |
|---|---|---|
| Component base | T050–T061 | Card, Chip, StreakBadge, Avatar, Toggle, ListRow (+SpotRow), StatTile, Confetti, BottomTabBar, ScreenHeader/BackButton, BottomSheet, SegmentedControl |
| Tests | T062 | `displayComponents`, `interactiveComponents`, `navigationComponents`, `Confetti` suites |
| QA sweeps | T063–T067 | Theme / VI-EN / touch-target / screen-reader / reduced-motion audits (code-level; see below) |
| E2E (Phase 7) | T068–T069 | Maestro `first-launch.yaml`, `returning-signin.yaml` |

### Files of record

- Components: `app/shared/ui/{Card,Chip,StreakBadge,Avatar,Toggle,ListRow,StatTile,Confetti}.tsx`
  and `app/shared/ui/navigation/{BottomTabBar,ScreenHeader,BackButton,BottomSheet,SegmentedControl}.tsx`
- Tests: `__tests__/ui/{displayComponents,interactiveComponents,navigationComponents,Confetti}.test.tsx`
- E2E: `mobile/.maestro/{first-launch,returning-signin}.yaml`

## QA sweep results (T063–T067) — code-level audit

Performed by review against the requirements + a full `tsc --noEmit` (0 app errors) and the 62-test
suite. Device-level visual confirmation still belongs to T070 (see "Pending").

- **T063 Light/dark (FR-007/SC-003)** — ✅ All 5 screens read theme tokens with `dark:` variants
  (`bg`/`ink`/`surface`/`sub`/`line`) or `useTheme()` colours; no light-only hardcoded surface
  colours. Onboarding is intentionally always-dark (photo scrim, theme-independent per design).
- **T064 VI/EN fit (FR-034/SC-004)** — ✅ Both full string tables present and parity-complete;
  headline/body strings sized comparably. ko/ja/fr are picker-only (fall back to en) per spec.
- **T065 Touch targets ≥44 (FR-017/SC-005)** — ✅ Button 54, Input 52, SelectRow ~64, IconButton
  44, SocialAuthButton 56, BackButton/IconButton 44. **Fixed here**: the Onboarding "Skip" pill is
  34px tall (prototype), now given `hitSlop` to reach an effective ≥44 target. Inline text links
  ("Quên mật khẩu?", footer links) sit within larger tappable text rows.
- **T066 Screen reader (FR-035/SC-007)** — ✅ Every interactive control exposes a role + label +
  state: `radio`/`radiogroup` (SelectRow/Language), `button` (Buttons/IconButtons/links),
  `switch` (Toggle), `progressbar` (ProgressBars), `tab`/`tablist` (Segmented/TabBar), `image`
  (Avatar), `header` (BrandLockup/titles). Error banners use `accessibilityLiveRegion="polite"`.
- **T067 Reduced motion (FR-036)** — ✅ Gated everywhere: BrandLockup gold-dot pulse (static),
  Onboarding paged `scrollTo` (`animated: !reducedMotion`), Confetti (renders `null`), BottomSheet
  slide (instant when enabled).

## Key decisions taken during implementation

1. **All 12 US4 components are unwired** (per `contracts/component-contracts.md`) — each still lands
   with a unit test proving render/behaviour/a11y/token usage, so "built to spec" ≠ untested.
2. **Test-infra hardening** for the component base:
   - `react-native-gesture-handler` is mocked via `mobile/__mocks__/react-native-gesture-handler.js`
     (auto-applied) — the library's own `jestSetup` references an RN internal shim path that moved
     in RN 0.86.
   - `tsconfig.json` now excludes the dead pre-migration files from type-checking (see ⚠️ below) and
     adds `types: ["jest"]` + a `declare module '*.css'` shim (`nativewind-env.d.ts`).
3. **T070/T071 are inherently manual** and can't run in a headless environment — left unchecked.

## ⚠️ Open item the team must decide (R2 cleanup)

The pre-migration files — `App.tsx`, `index.ts`, `app/navigation/`, `app/screens/`, and the old
`app/shared/ui/index.tsx` — are now **dead** (the entry is `expo-router/entry`, nothing imports
them). The plan said to leave `app/navigation/` in place, so **I did not delete them**. But note:

- They reference the *old* theme/i18n shape, so they're **excluded from `tsconfig`** to keep the
  build green.
- Under Expo Router, files with a default export under `app/` (the old `app/screens/*`,
  `app/navigation/RootNavigator.tsx`) can register as **stray routes**.

**Recommendation**: delete them to finish the R2 migration cleanly. Deferred to the team since it
contradicts the plan's written "leave in place" note — see the completion report / spawned task.

## How to verify

```bash
cd mobile && npm test          # 62 tests, 17 suites — all green
cd mobile && npx tsc --noEmit  # 0 app errors
# E2E (needs a built app / dev client + Maestro CLI):
maestro test .maestro/first-launch.yaml
maestro test .maestro/returning-signin.yaml
```

## Pending (manual — cannot run headless)

- **T070** — manual smoke test via Expo Go on real iOS + Android (quickstart.md steps 1–8).
- **T071** — non-technical-participant review of validation/sign-in error messages (SC-008).
