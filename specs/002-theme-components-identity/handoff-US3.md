# Handoff — US3: Returning Explorer signs back in with mock data

**Story**: Someone with an existing mock account signs back in and lands directly on the blank main
placeholder screen, skipping Onboarding. **Priority**: P2. **Status**: ✅ Complete, unit-tested
(green).

**Date**: 2026-07-23 · **Branch**: `002-theme-components-identity`

---

## What shipped

The **Log in** screen and the returning-Explorer path. Both first-launch (US2) and
returning-sign-in journeys now work end-to-end against mock data.

### Tasks completed (T042–T049)

| Task | Deliverable |
|---|---|
| T042 | Log in screen (reuses `PasswordInput`, `Divider`, `SocialAuthButton`) |
| T043 | Wire submit to `explorerRepository.login()` — error banner + email preserved |
| T044 | Success → signed-in + **onboarding marked complete** → straight to main (skips Onboarding) |
| T045 | Session-restore-on-relaunch (handled by the extracted `resolveRoute` guard) |
| T046 | Facebook/Zalo rendered disabled (FR-025) |
| T047–T049 | Login screen test, extended mock `login()` cases, routing-guard unit test |

### Files of record

- **Screen**: [`login.tsx`](../../mobile/app/(auth)/login.tsx)
- **New**: [`app/shared/lib/routing.ts`](../../mobile/app/shared/lib/routing.ts) — `resolveRoute`
  pure guard decision (see decision below)
- **Tests**: `__tests__/screens/login.test.tsx`, `__tests__/app/_layout.test.tsx`,
  extended `__tests__/mock/explorerRepository.test.ts`

## Key decisions taken during implementation

1. **Login marks onboarding complete.** Onboarding completion is a per-session flag
   (`sessionStore.onboardingCompletedAt`), and `signOut()` clears it. A returning Explorer has, by
   definition, already onboarded — so successful login calls **both** `signIn(id)` **and**
   `completeOnboarding()`, then routes to `/main`. Without the second call the guard would send them
   back through Onboarding. This is the mechanism behind US3 scenario 1 ("land directly on main").
   *If a later feature wants per-account onboarding memory, move that flag onto the `Explorer`
   record in the mock repository.*
2. **Extracted `resolveRoute` (routing.ts).** The routing-guard decision was pulled out of
   `_layout.tsx` into a pure function so it's unit-testable **without** importing `_layout` (which
   pulls in `global.css`, font loading, and `SplashScreen` side effects that don't belong in a unit
   test). `_layout.tsx`'s `RoutingGuard` now just calls `resolveRoute(...)` and `router.replace`s
   the result. T049 tests the pure function across every state transition.
3. **Invalid-credentials is deliberately vague.** The mock `login()` throws the same
   `invalid-credentials` code for unknown-email and wrong-password, so the UI banner never reveals
   which field was wrong. Email stays in component state → preserved on error (FR-023).
4. **Forgot-password link is visible but non-functional** (FR-028) — rendered, no handler, as in
   the prototype.

## How to verify US3 independently

```bash
cd mobile && npm test -- __tests__/screens/login.test.tsx __tests__/app __tests__/mock
```

Manual (Expo Go): register an account (US2), sign out / relaunch to Log in → enter the same
credentials → land directly on main (no Onboarding). Enter a wrong password → error banner, email
preserved. Facebook/Zalo appear dimmed/disabled.

## Environment notes

Unchanged from US1/US2 — jest 29, run via `npm test` / local jest binary, `--legacy-peer-deps`
installs. No new gotchas.

## What US3 deliberately does NOT do

- No real OAuth — social buttons are visual only (Google enabled-styled, FB/Zalo disabled).
- Forgot-password does nothing (FR-028).
- No per-account onboarding memory (see decision 1).

## Next: US4 (Every screen consistent, legible, accessible) + Polish

US4 (T050–T067) builds the remaining component base (Card, Chip, StreakBadge, Avatar, Toggle,
ListRow, StatTile, Confetti, BottomTabBar, ScreenHeader/BackButton, BottomSheet, SegmentedControl)
— **built-to-spec but unwired this feature** — each with a unit test (T062), then the cross-cutting
QA sweeps (T063–T067: theme, VI/EN fit, touch targets, screen reader, reduced motion). Phase 7
(T068–T071) adds Maestro E2E flows + manual smoke test. **Note**: the Onboarding photo placeholders
(US2 decision 3) are a known non-pixel-exact spot to revisit.
