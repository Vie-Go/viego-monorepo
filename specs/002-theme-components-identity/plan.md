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
`@expo-google-fonts/urbanist` for the brand typeface, Reanimated + Gesture Handler for the
animation catalogue (this introduces a dev-client requirement — Expo Go can no longer run the app
from this feature onward), `@expo/vector-icons` in place of the design doc's `iconsax-react-native`
suggestion, and a small mock account/session repository module with zero network calls.

**Flagged deviation**: this plan builds the component base as **custom themed React Native
primitives**, not `@expo/ui`, even though [`mobile/CLAUDE.md`](../../mobile/CLAUDE.md) currently
states `@expo/ui` as the default for new components. See Complexity Tracking below — `@expo/ui`
renders real native OS controls and cannot reproduce the prototype's custom cross-platform brand
skin, so following the prototype-exact instruction and following the `@expo/ui` default are
mutually exclusive for this feature; prototype fidelity was explicitly and repeatedly requested, so
it takes precedence.

## Technical Context

**Language/Version**: TypeScript on React Native (Expo SDK 57, React Native 0.86, React 19) —
already scaffolded in `mobile/` by Phase 0.

**Primary Dependencies**:
- Already present: `expo`, `@react-navigation/*` (being migrated off for this flow), `@tanstack/react-query` (unused by this feature — no backend calls), `react-native-safe-area-context`, `react-native-screens`.
- Added by this feature: `expo-router`, `zustand`, `react-native-reanimated`, `react-native-gesture-handler`, `expo-linear-gradient`, `expo-blur`, `react-native-svg`, `expo-font`, `expo-splash-screen`, `@expo-google-fonts/urbanist`, `@react-native-async-storage/async-storage`, `@expo/vector-icons`.

**Storage**: Client-only. `AsyncStorage` (via Zustand `persist`) for theme/language/mock
account+session data. No backend datastore is touched (N/A for this feature).

**Testing**: Jest + React Native Testing Library (existing project convention per
`mobile/CLAUDE.md`) for every component and screen; Maestro E2E flow for the full first-launch and
returning-sign-in journeys (cross-screen, matches `mobile/CLAUDE.md`'s guidance on when Maestro
flows are warranted).

**Target Platform**: iOS 15+ / Android via Expo — **development build required from this feature
onward** (Reanimated + Gesture Handler are native-code packages; Expo Go can no longer run the app).

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
  apply here. The one knowledge-base correction this plan makes (Onboarding Skip, R10) is a small
  edit to the existing `spec.md` assumption, not a new page. **PASS.**
- [x] **V. Immutable decisions & spec-first flow** — `spec.md` was authored and refined before this
  plan; the R10 correction updates the spec in the same change as discovering it, before
  implementation, not after. The `@expo/ui` deviation (R1) is recorded here with rationale rather
  than silently done; if it should become the standing rule for branded UI work, that's a
  `mobile/CLAUDE.md` amendment to raise separately, not something this plan does unilaterally.
  **PASS** (see Complexity Tracking for the deviation's justification).

No constitution violation blocks this plan; the one flagged deviation is from `mobile/CLAUDE.md`
project guidance (not a constitution principle) and is justified below.

## Project Structure

### Documentation (this feature)

```text
specs/002-theme-components-identity/
├── plan.md                        # This file
├── research.md                    # Phase 0 output — 10 decisions (R1–R10)
├── data-model.md                  # Phase 1 output — Theme/Language/Explorer/Session shapes
├── quickstart.md                  # Phase 1 output — install, dev-client build, manual smoke test
├── contracts/
│   └── component-contracts.md     # Phase 1 output — component prop contracts + mock data contract
└── tasks.md                       # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
mobile/                                    # Expo app (existing, Phase 0) — path: mobile/**
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
│       └── navigation/
│           ├── BottomTabBar.tsx, ScreenHeader.tsx, BackButton.tsx,
│           │   BottomSheet.tsx, SegmentedControl.tsx
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

> Fill ONLY if Constitution Check has violations that must be justified. The item below is a
> justified deviation from **project guidance** (`mobile/CLAUDE.md`), not a **constitution**
> violation — recorded here anyway for visibility since it's the single highest-impact decision in
> this plan.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| Component base built as custom RN primitives instead of `@expo/ui` (contradicts `mobile/CLAUDE.md`'s "default to `@expo/ui`" guidance) | The spec and this session's instructions require every component to match `prototype/VieGo.dc.html` exactly (colors, radii, shadows, Urbanist typeface) identically on iOS and Android | `@expo/ui` renders real native SwiftUI/Jetpack Compose controls — it cannot produce a single custom cross-platform brand skin at all, so it isn't a viable alternative for this specific requirement, only for generic/native-look UI work |
| Adding Reanimated + Gesture Handler ends Expo Go support for the whole app (not just this feature) | The design system's full animation catalogue (rise-in, pop, beat-pulse, gesture-driven bottom sheet) requires them; the design doc names Reanimated explicitly | Core `Animated` API can't express the gesture-driven bottom-sheet drag or match the design doc's own Reanimated mapping table |
