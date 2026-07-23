# Data Model — Theme, Component Base & First-Launch Identity Flow

All state below is **client-only** (mock/local, per FR-020) — no backend schema is introduced or
touched by this feature.

## Theme

| Field | Type | Notes |
|---|---|---|
| `name` | `'light' \| 'dark'` | Resolved from `Appearance.getColorScheme()`; no manual override UI in this feature (FR-005). |
| tokens | `palette`, `light`, `dark`, `radius`, `space`, `font`, `shadow` | Lifted verbatim from [design-system.md](../../docs/01-product-documentation/02-authored-system-documentation/ui-ux-design-document/design-system.md); extends `mobile/app/shared/theme/tokens.ts` to the full token set (current file has a partial palette/spacing/radius only — no `font`/`shadow`/heat-ramp/map tokens). |

**Persistence**: last-resolved theme name is persisted (Zustand `persist`, FR-004) even though it's
re-derived from the OS each cold launch — this keeps the storage shape ready for the future manual
toggle without changing shape later.

## Language Preference

| Field | Type | Notes |
|---|---|---|
| `code` | `'vi' \| 'en' \| 'ko' \| 'ja' \| 'fr'` | Supported set per design doc; only `vi`/`en` have full string tables in this feature (spec Assumptions). |
| `label` / `nativeLabel` | `string` | Shown in the Language Select rows; native names stay untranslated. |
| `source` | `'device' \| 'explicit'` | Whether the value came from device locale detection or an explicit pick — drives the pre-selected row on first launch (FR-018). |

**Persistence**: persisted (Zustand `persist`, FR-019) and applied immediately on change.

## Explorer (mock)

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Generated locally (e.g. `uuid`) — not a backend identity. |
| `displayName` | `string` | From Register's "Full name" field. |
| `email` | `string` | Unique within the mock store (duplicate-check, FR spec edge case). |
| `passwordHash` | `string` | Not real security — a placeholder transform (e.g. simple hash) so raw passwords aren't held verbatim in storage; real credential handling is a later feature's concern (spec Key Entities note). |
| `consentAcceptedAt` | `string (ISO date)` | Set when the registration consent line (FR-027) is acknowledged. |

**Storage**: an array/map in the mock repository (R9), persisted to `AsyncStorage` so accounts
survive app restarts within a single install (needed for Story 3 — returning sign-in — to be
testable without re-registering every run).

## Session (mock)

| Field | Type | Notes |
|---|---|---|
| `explorerId` | `string \| null` | `null` when signed out. |
| `status` | `'signed-out' \| 'signed-in'` | Drives routing: signed-out → Language/Log in stack; signed-in → placeholder main. |
| `onboardingCompletedAt` | `string (ISO date) \| null` | Set once Onboarding's final step is confirmed or Skip is used (R10); gates whether Onboarding is shown again (FR-029). |

**Persistence**: persisted (Zustand `persist`) so a relaunch with a valid session skips straight to
the placeholder main screen (FR-033).

## State transitions (mock session)

```
[no language stored] → Language Select
        │ pick + continue
        ▼
[no session] → Log in ⇄ Register
        │ successful register            │ successful login
        ▼                                 │
   Onboarding (Skip or finish)            │
        │                                 │
        └────────────► signed-in, onboardingCompletedAt set ─┐
                                                              ▼
                                                  Blank main placeholder
```

On relaunch: `signed-in` + `onboardingCompletedAt` set → skip straight to placeholder main
(FR-033). `signed-in` without a completed onboarding (should not normally occur, but guards the
"backgrounded mid-onboarding" edge case) → resume Onboarding. No stored language → Language Select
regardless of session state.
