# Handoff: Phase 6 (US4 — The app runs on real accounts, not mock data)

**Status**: T039–T051 complete and marked `[X]` in [tasks.md](tasks.md).

## What's built

- `shared/api/auth.ts` — `requestEmailChallenge`, `signInWithEmailCode`, `signInWithGoogle`,
  `refresh`, `getMe`, `updatePreferences` (plain typed functions, `Session`/`Explorer`/
  `Preferences` types matching the OpenAPI schemas).
- `shared/api/useGoogleSignIn.ts` — new shared hook (both Log in and Register needed identical
  wiring) around `expo-auth-session`'s `useAuthRequest` with `ResponseType.IdToken` + Google's OIDC
  discovery + a nonce, per research R6.
- `login.tsx` — password field removed; email→code two-step flow (`useMutation` per step); Google
  button wired to `useGoogleSignIn`; on success, tokens go to `authTokenStore`, the
  `['identity','me']` cache is seeded, `sessionStore.signIn()` fires, onboarding is marked
  complete (returning Explorer skips it), then `/main`. FR-018 connectivity errors
  (`TypeError` from a failed `fetch`) are shown distinctly from an invalid/expired code.
- `register.tsx` — the same flow; on success routes to `/(auth)/onboarding` instead. **No "Full
  name" field** — see the contract-gap note below.
- `ProfileScreen.tsx` — was dead code (never mounted in any route/navigator — confirmed by grep;
  also had two calls to `toggleTheme`/`toggleLocale` that don't exist on the current
  `ThemeProvider`/`I18nProvider` APIs, a pre-existing break). Rewired to `useQuery(['identity','me'], getMe)`
  + a `useMutation(updatePreferences)` with optimistic cache update and rollback on error. Also
  fixed a real, pre-existing type error (`theme.background`/`textMuted` don't exist on the current
  `ThemeColors` — switched to `tokens.ts`'s own documented `lightTheme`/`darkTheme` "backward-compatible"
  exports, which is exactly what they're there for).
- `authTokenStore.ts`, `client.ts` interceptor, `QueryClientProvider` — from Phase 2 (T010–T012),
  unchanged this phase.
- `sessionStore.ts` — unchanged shape (T043); token persistence happens at the call sites
  (`login.tsx`/`register.tsx`'s mutation `onSuccess`), not inside the store.
- `mobile/app/shared/mock/explorerRepository.ts` **deleted** (FR-017); zero remaining references
  (grep-confirmed) — the empty `shared/mock/` directory was removed too.
- Tests: `login.test.tsx`, `register.test.tsx` rewritten for the passwordless flow;
  `authTokenStore.test.ts`, `auth.test.ts` (one test per exported function), `ProfileScreen.test.tsx`
  (fetch, optimistic update, rollback) all new. `__tests__/mock/explorerRepository.test.ts` deleted.
  `testUtils.tsx`'s shared `AllProviders` now wraps every screen test in a `QueryClientProvider`
  (retries disabled) — needed globally the moment `login.tsx`/`register.tsx` started using
  `useMutation`, not just for `ProfileScreen.test.tsx`.
- `.maestro/identity-live-auth.yaml` — new flow per T051. Also **updated** the two pre-existing
  Maestro flows (`first-launch.yaml`, `returning-signin.yaml`) that still referenced the removed
  password field/"Full name" input — left as-is they would have failed immediately against the
  rewired screens.

## Verification performed

- Full mobile suite: **19/19 suites, 71/71 tests green** (`npx jest` from `mobile/`).
- `npx tsc --noEmit` — clean except pre-existing errors in `shared/ui/index.tsx` (confirmed via
  `git diff` — that file is untouched by this feature; it's older Phase-0 code already broken
  before this session, see Known pre-existing issue below).
- Maestro flows are un-runnable here (no device/simulator, no dev build) — written and reviewed
  for correctness only.

## Two things worth flagging prominently

### 1. Expo Go cannot actually complete the Google sign-in redirect (confirmed against current Expo docs)

research.md R6 states `expo-auth-session` "doesn't reopen the dev-client question this project has
deliberately avoided so far." Checking Expo's current documentation (`mcp__expo__read_documentation`)
during this phase found that's no longer accurate:

> "Expo Go cannot be used for local development and testing of OAuth or OpenID Connect-enabled
> apps due to the inability to complete an OAuth/OIDC redirect (no custom scheme support). You can
> instead use a Development Build."

And separately, Expo's dedicated Google guide now says outright: *"These libraries can't be used
in Expo Go because they require custom native code."* (`expo-auth-session/providers/google` is
itself now documented as **Deprecated**, superseded by native libraries that also require a
dev-client build.)

**What this means concretely**: `useGoogleSignIn`'s wiring (generic `useAuthRequest` +
`ResponseType.IdToken` + Google's OIDC discovery) is implemented correctly against
`expo-auth-session`'s current API and will work in a development build. It **will not** complete
the redirect in plain Expo Go — pressing the button opens the browser but can't hand control back
to the app. This is a real drift between research.md's assumption and current Expo reality, not a
bug in this implementation. **Someone needs to decide**: accept a dev-client build (breaking the
Expo-Go-only precedent `002` established) to actually exercise Google sign-in, or treat Google as
deferred alongside Facebook/Zalo until that trade-off is revisited. Email sign-in is fully
Expo-Go-compatible and unaffected either way.

### 2. Register has no display-name field — the contract has nowhere to put one

`POST /auth/{provider}` for `provider=email` only accepts `email`/`code` (contracts/rest-api.identity.openapi.yaml).
`RegisterOrSignInService` always derives `displayName` from the email local part (or the Google
profile name for that provider) — there is no field anywhere in the contract for a client-supplied
display name. The original mock-era `register.tsx` had a "Full name" input; keeping it in the
rewired screen would silently discard whatever the Explorer typed, which is worse than not asking.
It was removed, and Log in/Register are now the same screen in substance (shared email+code flow,
differing only in copy and post-success destination), matching the backend's actual find-or-create
semantics (FR-001/FR-002). Flagging this as a real, current contract gap — display-name
customization is a legitimate future feature, just not one this contract (or this task list)
covers.

## Known pre-existing issue (not touched, not introduced by this feature)

`mobile/app/shared/ui/index.tsx` (the legacy Phase-0 Button/Card/Input barrel) references
`theme.primary`/`theme.border`/`theme.textMuted` — fields that don't exist on the current
`ThemeColors` type (`useTheme()`'s actual return shape). `tsc --noEmit` reports 6 errors there.
Confirmed via `git diff` this file is untouched this session; `ProfileScreen.tsx` (which imports
from this same barrel) hit the identical issue and was fixed by switching to `tokens.ts`'s
purpose-built `lightTheme`/`darkTheme` compatibility exports instead. `shared/ui/index.tsx` itself
is out of this feature's scope to fix.

## What's left

Phase 7 (polish/cross-cutting) — see [tasks.md](tasks.md).
