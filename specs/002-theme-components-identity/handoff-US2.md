# Handoff — US2: New Explorer completes first-launch setup with mock data

**Story**: A new person creates a mock account and moves through Onboarding to the blank main
placeholder screen, with zero backend calls. **Priority**: P1. **Status**: ✅ Complete,
unit-tested (green).

**Date**: 2026-07-23 · **Branch**: `002-theme-components-identity`

---

## What shipped

The first fully end-to-end demoable path: **language → register → onboarding → blank main**, all on
mock/local data (FR-020). Builds on US1's foundation.

### Tasks completed (T030–T041)

| Task | Deliverable |
|---|---|
| T030 | `ProgressBars` (progress-primitive a11y semantics) |
| T031–T032 | Register screen + wiring to `explorerRepository.register()` |
| T033–T035, T037 | Onboarding (3 slides, scrim, Skip, swipe+tap, reduced-motion gating, resume guard) |
| T036 | Blank main placeholder screen |
| T038–T041 | Register / Onboarding / main / mock-repo unit tests |

### Files of record

- **Screens**: [`register.tsx`](../../mobile/app/(auth)/register.tsx),
  [`onboarding.tsx`](../../mobile/app/(auth)/onboarding.tsx),
  [`main.tsx`](../../mobile/app/main.tsx)
- **Components**: [`ProgressBars.tsx`](../../mobile/app/shared/ui/ProgressBars.tsx),
  [`PasswordInput.tsx`](../../mobile/app/shared/ui/PasswordInput.tsx) (new — reused by US3 Login),
  `Input.tsx` (extended with `rightSlot` for the password reveal)
- **Logic**: [`explorerRepository.ts`](../../mobile/app/shared/mock/explorerRepository.ts),
  [`validation.ts`](../../mobile/app/shared/lib/validation.ts) (new shared form validation)

## Key decisions taken during implementation

1. **`PasswordInput` + `Input.rightSlot`.** Rather than duplicate a reveal toggle in two screens, I
   added an optional `rightSlot` adornment to `Input` and a `PasswordInput` wrapper (Eye/EyeOff
   `IconButton`). US3's Login reuses it directly.
2. **Validation returns i18n keys, not literal copy** (`shared/lib/validation.ts`) — keeps VI/EN
   parity (FR-034). Screens translate the returned key at render.
3. **Onboarding backgrounds are placeholder gradients**, not photos. The prototype references
   `assets/photos/scenery-*.jpg`, which don't exist in `mobile/assets`. Each slide uses a per-slide
   `LinearGradient` under the shared dark scrim so it renders correctly today. **⚠️ Follow-up: drop
   the real scenery images in and swap the `colors` arrays in `onboarding.tsx` for `Image`/`expo-image`
   backgrounds** — this is the one place the build isn't yet prototype-pixel-exact.
4. **Reduced-motion (T037/FR-036)** is honored two ways: the paged `scrollTo` uses
   `animated: !reducedMotion`, and the brand gold-dot pulse (`BrandLockup`) is already static under
   reduced motion. Full cross-screen audit is deferred to US4/T067.
5. **Backgrounded-mid-onboarding resume (T035)** needed **no screen code** — the `_layout.tsx`
   routing guard already routes `signed-in && !onboardingCompletedAt → onboarding`, so a relaunch
   resumes there without a lost/duplicated account (US2 scenario 4).
6. **Session model**: `register()` success calls `sessionStore.signIn(id)` (status → signed-in,
   `onboardingCompletedAt` still null), so the guard shows Onboarding; finishing/Skip calls
   `completeOnboarding()` → main. Onboarding is never shown again once `onboardingCompletedAt` is set.

## How to verify US2 independently

```bash
cd mobile && npm test -- __tests__/screens/register.test.tsx __tests__/screens/onboarding.test.tsx __tests__/screens/main.test.tsx __tests__/mock
```

Manual (Expo Go): from Language Select → Continue → Register → fill name/email/password → Create
account → Onboarding (swipe or tap the gold CTA through 3 slides, or Skip) → blank main placeholder.
Force-quit mid-onboarding and relaunch → resumes at Onboarding.

## Environment notes

Same as US1's handoff — jest **29** (not 30), run via local jest binary / `npm test`,
`--legacy-peer-deps` for installs, Reanimated `useReducedMotion` is mock-augmented in
`jest.setup.js`. No new environment gotchas in US2.

## What US2 deliberately does NOT do

- No real Log in screen yet (still the US1 stub) — that's US3.
- Facebook/Zalo social buttons render **disabled** (FR-025); only Google is enabled-styled (none
  are actually wired — no OAuth in this feature).
- Onboarding photos are gradient placeholders (see decision 3).

## Next: US3 (Returning Explorer signs back in)

Depends on US2's `register()` path (accounts must exist to sign back in). Build order: Login screen
(T042) reusing `PasswordInput`/`SocialAuthButton`/`Divider` → wire to `explorerRepository.login()`
(T043–T044) → session-restore-on-relaunch guard (T045, mostly already in `_layout.tsx`) →
disabled-provider state (T046) → tests incl. `_layout` routing-guard test (T047–T049).
