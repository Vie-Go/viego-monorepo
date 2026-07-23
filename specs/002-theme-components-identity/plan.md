# Implementation Plan: Theme, Component Base & First-Launch Identity Flow

**Branch**: `002-theme-components-identity` | **Date**: 2026-07-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-theme-components-identity/spec.md`

## Summary

Deliver the shared visual/interaction foundation the rest of the mobile app builds on — a
light/dark theme, the full base component library, and the project tooling to support both — proved
end-to-end by building Language Select, Log in, Register, and Onboarding against **mock/local data
only**, landing on a blank main placeholder screen. No live backend call is made (the Identity
backend module is still an empty skeleton); Profile & Preferences, Snap/Camera, and Map/Exploration
are explicitly out of scope.

**Non-negotiable for this plan**: every component and screen must match
**`prototype/VieGo.dc.html`** ("viego") **exactly** — colors, shapes, radii, shadows, typography,
copy, and behavior — as it exists in the repository right now. Where the authored design docs and
the live prototype disagree (found one case — see [research.md](research.md) R10, Onboarding
Skip), the **prototype wins** for this plan, and the design doc/spec is corrected to match rather
than silently diverged from.

Technical approach (full detail in [research.md](research.md)): Expo Router (file-based routing,
migrating off the pre-migration manual navigator), Zustand with persisted storage for
theme/language/mock-session, the existing hand-rolled i18n provider extended rather than replaced,
`@expo-google-fonts/urbanist` for the brand typeface, Reanimated v4 + Gesture Handler for the
animation catalogue (verified against Expo's own SDK docs to remain fully **Expo Go**-compatible —
no dev-client build is needed for this feature), `lucide-react-native` in place of the design doc's
`iconsax-react-native` suggestion, and a small mock account/session repository module with zero
network calls.

**Stack-level decision, now formalized**: this plan builds the component base with **NativeWind v4
+ React Native Reusables (RNR)** — copy-paste components built on accessible `@rn-primitives/*`
packages, restyled with a VieGo-specific Tailwind theme — not `@expo/ui`. `@expo/ui` renders real
native OS controls and cannot reproduce the prototype's custom cross-platform brand skin, so
following the prototype-exact instruction and defaulting to `@expo/ui` were mutually exclusive for
this feature; prototype fidelity was explicitly and repeatedly requested, so it took precedence.
This is no longer just a one-feature deviation: it's recorded as
[ADR-0012](../../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/decisions/0012-nativewind-and-react-native-reusables-for-mobile-ui.md)
and [`mobile/CLAUDE.md`](../../mobile/CLAUDE.md) has been amended in this same change to make
NativeWind/RNR the standing default for all mobile UI work, superseding `@expo/ui`'s previous
(never formally-ADR'd) default. NativeWind/RNR was chosen over fully hand-rolling every primitive
from scratch because it gives working, accessible control behavior (switch, radio-group, select,
toggle, dialog, etc. — verified present in `@rn-primitives`) for less first-party code, while still
rendering plain RN views (not native OS chrome), so it doesn't reopen the `@expo/ui` problem.
Compatibility with this project's exact dependency versions (Expo 57, RN 0.86, React 19) was
checked against RNR's own showcase app — see [research.md](research.md) R1.

## Technical Context

**Language/Version**: TypeScript on React Native (Expo SDK 57, React Native 0.86, React 19) —
already scaffolded in `mobile/` by Phase 0.

**Primary Dependencies**:
- Already present: `expo`, `@react-navigation/*` (being migrated off for this flow), `@tanstack/react-query` (unused by this feature — no backend calls), `react-native-safe-area-context`, `react-native-screens`.
- Added by this feature: `expo-router`, `zustand`, `nativewind` (+ `tailwindcss`), React Native
  Reusables copy-paste components sourced from `@rn-primitives/*` (`switch`, `radio-group`,
  `select`, `toggle`, `dialog`, `progress`, `avatar`, etc.), `react-native-reanimated` (v4.x),
  `react-native-gesture-handler`, `expo-linear-gradient`, `expo-blur`, `react-native-svg`,
  `expo-font`, `expo-splash-screen`, `@expo-google-fonts/urbanist`,
  `@react-native-async-storage/async-storage`, `lucide-react-native`.

**Storage**: Client-only. `AsyncStorage` (via Zustand `persist`) for theme/language/mock
account+session data. No backend datastore is touched (N/A for this feature).

**Testing**: Jest + React Native Testing Library (existing project convention per
`mobile/CLAUDE.md`) for every component and screen; Maestro E2E flow for the full first-launch and
returning-sign-in journeys (cross-screen, matches `mobile/CLAUDE.md`'s guidance on when Maestro
flows are warranted).

**Target Platform**: iOS 15+ / Android via Expo — runs in **Expo Go**, same as Phase 0 (verified:
every added native-code package — Reanimated, Gesture Handler, SVG, Blur, Linear Gradient,
AsyncStorage — is officially "Included in Expo Go" per Expo's SDK 57 reference; no dev-client
build is required by this feature).

**Project Type**: Mobile (existing `mobile/` app within the Phase 0 monorepo; no backend change).

**Performance Goals**: None beyond the spec's UX targets (SC-001 ≤3 min first-launch, SC-002 ≤30s
returning sign-in) — no throughput/latency target, this feature makes no network calls.

**Constraints**: Pixel/behavior fidelity to `prototype/VieGo.dc.html` (this plan's non-negotiable,
above); ≥44×44px touch targets; full VI/EN string parity; reduced-motion honored on every
animation; `ApplicationModules.verify()` is unaffected (backend untouched).

**Scale/Scope**: 4 first-launch screens (Language Select, Log in, Register, Onboarding) + 1 blank
placeholder screen; ~18 base components (7 wired into these screens, ~11 built-to-spec for later
features per [contracts/component-contracts.md](contracts/component-contracts.md)); 2 full string
tables (vi, en) + 3 selectable-only locale entries (ko, ja, fr).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verified against the VieGo Documentation Constitution (`.specify/memory/constitution.md`):

- [x] **I. Specs are source of truth** — This feature has no OpenAPI/AsyncAPI/Gherkin surface (no
  backend behavior changes); its "interface" is the component prop/behavior contract, captured in
  [contracts/component-contracts.md](contracts/component-contracts.md) per the plan template's
  allowance for UI contracts. No behavior is inferred from code — the prototype and design docs are
  the source, and the one place they disagree (R10) is resolved by correcting the doc/spec in this
  same change rather than leaving silent drift. **PASS.**
- [x] **II. Ubiquitous language** — Uses existing terms only (Explorer, Identity module, Onboarding,
  province/streak concepts untouched). No new domain terms introduced. **PASS.**
- [x] **III. Architecture & module boundaries** — Mobile-only change; no backend module touched;
  `ApplicationModules.verify()` is unaffected. **PASS.**
- [x] **IV. Documentation conventions** — This plan's own artifacts follow the SDD template
  structure under `specs/` (not the docmd knowledge base), so frontmatter/taxonomy rules don't
  apply to them directly. This change does add one new knowledge-base page —
  [ADR-0012](../../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/decisions/0012-nativewind-and-react-native-reusables-for-mobile-ui.md)
  — placed in the correct taxonomy (`decisions/`) with `title`/`description` frontmatter, plus the
  small Onboarding Skip correction (R10) to the existing `spec.md` assumption. **PASS.**
- [x] **V. Immutable decisions & spec-first flow** — `spec.md` was authored and refined before this
  plan; the R10 correction updates the spec in the same change as discovering it, before
  implementation, not after. The `@expo/ui` → NativeWind/RNR change is a stack-level UI-kit swap,
  which `mobile/CLAUDE.md` itself requires to be an ADR, not a drive-by refactor — recorded as
  **ADR-0012** (new, not editing any prior ADR; the previous `@expo/ui` default was never itself
  formally an ADR, so nothing is superseded in the ADR log, but `mobile/CLAUDE.md`'s guidance is
  updated to match in this same change). **PASS.**

No constitution violation blocks this plan.

## Project Structure

### Documentation (this feature)

```text
specs/002-theme-components-identity/
├── plan.md                        # This file
├── research.md                    # Phase 0 output — 10 decisions (R1–R10)
├── data-model.md                  # Phase 1 output — Theme/Language/Explorer/Session shapes
├── quickstart.md                  # Phase 1 output — install (Expo Go compatible), manual smoke test
├── contracts/
│   └── component-contracts.md     # Phase 1 output — component prop contracts + mock data contract
└── tasks.md                       # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
mobile/                                    # Expo app (existing, Phase 0) — path: mobile/**
├── tailwind.config.js                     # NEW — VieGo token theme (colors/radius/spacing/font) for NativeWind — research.md R1
├── global.css                             # NEW — NativeWind's Tailwind entrypoint
├── babel.config.js                        # UPDATED — NativeWind babel preset
├── metro.config.js                        # UPDATED — NativeWind metro wrapper
├── app/                                   # Expo Router routes (NEW for this feature — migrates off app/navigation/)
│   ├── _layout.tsx                        # Root layout: Theme/I18n/Session providers, font load, routing guard
│   ├── (auth)/
│   │   ├── language.tsx                   # Language Select
│   │   ├── login.tsx                      # Log in
│   │   ├── register.tsx                   # Register
│   │   └── onboarding.tsx                 # Onboarding (3 slides, Skip — R10)
│   └── main.tsx                           # Blank main placeholder (FR-031–033)
├── app/navigation/                        # EXISTING pre-migration manual navigator — left in place,
│   │                                        not extended (superseded by app/ routes for this flow)
│   └── ...
├── app/shared/
│   ├── theme/
│   │   ├── tokens.ts                      # EXTENDED — full token set (palette/light/dark/radius/space/font/shadow)
│   │   └── ThemeProvider.tsx              # EXTENDED — resolves from Appearance, persists (Zustand)
│   ├── i18n/
│   │   ├── translations.ts                # EXTENDED — + ko/ja/fr picker metadata, Identity-screen strings
│   │   └── I18nProvider.tsx                # EXTENDED — persists chosen locale
│   ├── store/                             # NEW — Zustand stores (theme, language, session) — research.md R3
│   ├── mock/                              # NEW — explorerRepository.ts (mock account/session) — research.md R9
│   └── ui/                                # EXTENDED — full component base — research.md R1, contracts/component-contracts.md
│       ├── Button.tsx, Input.tsx, Card.tsx, Chip.tsx, Toggle.tsx, Avatar.tsx,
│       │   ListRow.tsx, StatTile.tsx, SelectRow.tsx, SocialAuthButton.tsx,
│       │   ProgressBars.tsx, Confetti.tsx, IconButton.tsx, Divider.tsx, StreakBadge.tsx
│       │   # ^ sourced from React Native Reusables' copy-paste components where an
│       │   #   @rn-primitives equivalent exists (switch, radio-group, select, toggle,
│       │   #   progress, avatar, checkbox), restyled to the VieGo Tailwind theme;
│       │   #   hand-built where no primitive fits (e.g. Divider, StreakBadge) — research.md R1
│       └── navigation/
│           ├── BottomTabBar.tsx, ScreenHeader.tsx, BackButton.tsx,
│           │   BottomSheet.tsx, SegmentedControl.tsx
│           │   # ^ no @rn-primitives equivalent (no bottom-sheet/drawer primitive exists);
│           │   #   hand-built with Reanimated + Gesture Handler — research.md R1, R6
├── __tests__/                             # Jest + RNTL — one file per component/screen (existing convention)
├── .maestro/                              # NEW — first-launch + returning-sign-in E2E flows
├── app.json                               # UPDATED — config plugins for new native packages (research.md R6/R8)
└── package.json                           # UPDATED — new dependencies (see quickstart.md)
```

**Structure Decision**: Mobile-only change within the existing Phase 0 monorepo layout
(`mobile/**` path scope, same CI path-filter as Phase 0). No `backend/**` or `contracts/**`
(top-level) changes. This feature's own `app/` directory is Expo Router's routing root — the
existing `app/navigation/` tree is left in place (not deleted, other Phase-0 code may still
reference it) but is not extended for this flow, per research.md R2.

## Complexity Tracking

> No constitution violations — section intentionally empty.

Earlier drafts of this plan carried two items here that no longer belong in this table:

- **NativeWind/RNR instead of `@expo/ui`** was tracked as a deviation from `mobile/CLAUDE.md`
  project guidance. It no longer is one: `mobile/CLAUDE.md` has been amended in this same change
  (see Summary above) to make NativeWind/RNR the standing default, formalized as
  [ADR-0012](../../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/decisions/0012-nativewind-and-react-native-reusables-for-mobile-ui.md).
  The added Tailwind/NativeWind build-tooling layer (babel + metro plugin, `tailwind.config.js`) is
  now just part of adopting that standing default, not a one-off complexity — see research.md R1
  and ADR-0012's Consequences for the tradeoffs.
- **"Reanimated + Gesture Handler end Expo Go support"** was listed as a violation in an even
  earlier draft. That was **wrong** — verified against Expo's SDK 57 reference, both packages (and
  every other native-code package this feature adds) are officially "Included in Expo Go." See
  research.md R6.
