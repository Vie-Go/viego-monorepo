# Phase 0 Research — Theme, Component Base & First-Launch Identity Flow

Each item: **Decision · Rationale · Alternatives considered**. Starting point: `mobile/` already
exists from [Phase 0](../001-phase-0-walking-skeleton/plan.md) with Expo SDK 57, React Native 0.86,
React 19, TypeScript, `@react-navigation/*`, TanStack Query, and hand-rolled `ThemeProvider` /
`I18nProvider` / `shared/ui` primitives — all pre-migration per [`mobile/CLAUDE.md`](../../mobile/CLAUDE.md).

## R1. Component rendering approach — custom themed primitives, NOT `@expo/ui` *(deviation, see Complexity Tracking)*

**Decision**: Build the component base as **custom React Native primitives** (`View` / `Pressable`
/ `Text` + `StyleSheet`, reading theme tokens), continuing and formalizing the existing
`app/shared/ui/` pattern — not `@expo/ui`.

**Rationale**: The user has twice, explicitly, directed pixel-fidelity to the live prototype
(`prototype/VieGo.dc.html`): exact crimson pill buttons with a colored glow shadow, exact 16–27px
radii, exact Urbanist weights, exact gold accents, identical shapes on iOS and Android. `@expo/ui`
renders **real SwiftUI on iOS and real Jetpack Compose on Android** — by design it looks like each
platform's native controls and cannot render one custom, cross-platform-identical brand skin. This
is a hard technical ceiling, not a styling preference: a `@expo/ui` `Switch` is an OS switch; a
`@expo/ui` `Button` is an OS button. No modifier makes it a 54px crimson pill with `shadow.glow`.
This is a **deliberate, scoped exception** to `mobile/CLAUDE.md`'s standing "default to `@expo/ui`"
guidance for new components — flagged prominently rather than silently overridden (see Complexity
Tracking below); `mobile/CLAUDE.md` should get a follow-up note carving out "branded/prototype-exact
component base" as an explicit exception category.

**Alternatives considered**:
- **`@expo/ui` per the standing default** — rejected: cannot reproduce the prototype's custom shapes/
  shadows/typeface; would mean the "must follow prototype exactly" instruction is simply not
  achievable.
- **Hybrid** (`@expo/ui` for generic layout, custom for branded controls) — rejected for this
  feature: the whole component set (Button, Input, Chip, Toggle, etc.) is brand-specific in the
  design system, so splitting rendering strategies mid-library adds inconsistency and complexity
  for no benefit here.

## R2. Navigation — migrate this flow onto Expo Router now

**Decision**: Introduce `expo-router` and implement Language Select → Log in/Register → Onboarding
→ blank main placeholder as file-based routes under `mobile/app/` (Expo Router's own `app/`
convention), retiring the manual `@react-navigation/native-stack` stack in
[`RootNavigator.tsx`](../../mobile/app/navigation/RootNavigator.tsx) for this flow rather than
extending it.

**Rationale**: [ADR-0011](../../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/decisions/0011-expo-router-zustand-maestro-for-mobile.md)
and `mobile/CLAUDE.md` already name Expo Router as the target and explicitly say new/changed
screens should move to file-based routes rather than extend the pre-migration navigator. This
feature builds five brand-new screens — the natural, lowest-friction point to do the migration
instead of adding a sixth screen to the pattern being retired.

**Alternatives considered**: extend `RootNavigator.tsx` with the new screens — rejected, directly
contradicts `mobile/CLAUDE.md`'s explicit instruction not to extend it further.

## R3. Client/session state — Zustand with persisted storage

**Decision**: Use **Zustand** (already an ADR-0011 decision) for theme resolution, active language,
and the mock auth session/onboarding-complete flag, backed by
`@react-native-async-storage/async-storage` via Zustand's `persist` middleware.

**Rationale**: `mobile/CLAUDE.md` names exactly this use case for Zustand ("theme toggle, auth
session flags"). Persisting via `persist` middleware satisfies FR-004/FR-019/FR-033 (theme/language/
session survive restarts) with no bespoke storage code.

**Alternatives considered**: React Context + manual `AsyncStorage` reads/writes (more boilerplate,
re-litigates a decision already made in ADR-0011); `expo-secure-store` (built for secrets — mock
session/preferences aren't secrets, plain `AsyncStorage` is the right tier).

## R4. Localization — extend the existing hand-rolled provider, not `react-i18next`

**Decision**: Keep and extend [`I18nProvider`](../../mobile/app/shared/i18n/I18nProvider.tsx)
(already working, VI/EN complete) rather than introducing `react-i18next`. Add the three additional
selectable locale codes (`ko`, `ja`, `fr`) as picker entries with native-name metadata only (per
spec Assumptions — only vi/en need full string parity), and persist the chosen locale via the R3
Zustand store.

**Rationale**: [Phase 0's plan](../001-phase-0-walking-skeleton/plan.md) named "react-i18next **or
equivalent**" — the existing provider is a working equivalent with zero migration risk; swapping
libraries here is unjustified churn for a component-and-screens feature.

**Alternatives considered**: `react-i18next` — rejected for now (real library swap is a separate,
independently-justifiable change, not a side effect of this feature).

## R5. Fonts — `@expo-google-fonts/urbanist`, not hand-vendored `.ttf` files

**Decision**: Load Urbanist via `@expo-google-fonts/urbanist` + `expo-font` +
`expo-splash-screen` (keep the splash screen visible via `SplashScreen.preventAutoHideAsync()`
until fonts resolve), for weights 400/500/600/700/800 per the design system.

**Rationale**: The design system doc says "ship the `.ttf` files in `assets/fonts`" — the
Expo-ecosystem equivalent of that instruction is the official `@expo-google-fonts/*` package family
(no manual font file sourcing/licensing to manage, versioned like any other dependency, same
non-system-fallback guarantee).

**Alternatives considered**: manually download and commit `.ttf` binaries — rejected, more manual
maintenance for an outcome the Expo Google Fonts package already gives.

## R6. Animation — Reanimated + Gesture Handler (dev-client required)

**Decision**: Add `react-native-reanimated` and `react-native-gesture-handler` for the animation
catalogue (rise-in, pop, beat-pulse, slide-up sheet, ping) per the design system's Reanimated
mapping, all gated on `useReducedMotion()`.

**Rationale**: The design system explicitly specifies Reanimated 3 worklets; this is the only
component set decision with a real platform consequence worth calling out per `mobile/CLAUDE.md`'s
explicit instruction: **adding native-code packages means Expo Go can no longer run this app** — the
project needs an `expo-dev-client` build from this feature onward. This is a one-time cost for the
whole rest of the mobile roadmap (every later module also needs these animations), not specific to
Identity screens.

**Alternatives considered**: the core `Animated` API — rejected, cannot cleanly express the
gesture-driven bottom-sheet drag or match the design system's own Reanimated mapping table.

## R7. Icons — `@expo/vector-icons`, substituting for `iconsax-react-native`

**Decision**: Use the Expo-bundled `@expo/vector-icons` (Ionicons/Feather glyph sets) as the icon
source, mapping each prototype `<v-icon name="…">` to the closest available glyph, rather than
`iconsax-react-native`.

**Rationale**: `@expo/vector-icons` ships with Expo (no extra native install, no config plugin,
works in Expo Go until R6's dev-client requirement lands anyway), and the design system explicitly
allows "or a bundled SVG set" as an alternative to iconsax. Icon *names* won't match 1:1, but shapes
close enough are available for every icon this feature needs (back arrow, eye/eye-off, checkmark,
radio dot, chevrons, google/facebook/zalo glyphs as brand-lettered circles per the prototype itself).

**Alternatives considered**: `iconsax-react-native` — rejected: not an Expo-first package, adds an
unvetted native/SVG dependency for a cosmetic gain the bundled set already covers well enough.

## R8. Gradients, blur, SVG — `expo-linear-gradient`, `expo-blur`, `react-native-svg`

**Decision**: Add these three for the onboarding scrim gradient, the (built-but-unwired-in-this-
feature) `BottomTabBar`'s blur, and SVG-based icons/graphics where needed, per the design system's
prototype→React Native translation table.

**Rationale**: Directly named in [design-system.md](../../docs/01-product-documentation/02-authored-system-documentation/ui-ux-design-document/design-system.md)'s
translation layer; no simpler substitute renders the same effects.

**Alternatives considered**: none — these are the design doc's own named mappings.

## R9. Mock account/session layer

**Decision**: A small in-memory + `AsyncStorage`-backed mock repository module
(`shared/mock/explorerRepository`) simulating register/login/duplicate-email-check/session, used
by the Zustand auth store (R3). No network client is touched.

**Rationale**: FR-020 requires mock-only data with zero backend calls; a small dedicated module
keeps that boundary obvious and swappable — a later feature replaces only this module's internals
with real API calls (per spec Assumptions), without changing any screen.

**Alternatives considered**: stub the existing TanStack Query API client — rejected, would blur the
"no backend call" boundary FR-020 requires and complicate the later real-API swap.

## R10. Onboarding "Skip" — prototype has one; the design doc's "no skip" default is superseded

**Decision**: Implement the Onboarding screen **with** a "Skip" pill (top-right, as in
`prototype/VieGo.dc.html`), correcting the design doc/spec's earlier "no skip" default.

**Rationale**: `prototype/VieGo.dc.html` (lines ~223–238) renders an explicit `Skip` control
(`obSkip`) on every onboarding slide. The UI/UX design doc's `screens/identity.md` said "Skippable?
(product decision — default: no skip)" — but per this session's explicit instruction to match "what
prototype showing right now," the live prototype wins. [spec.md](spec.md)'s matching assumption is
corrected in the same change as this plan.

**Alternatives considered**: keep "no skip" per the design doc — rejected, contradicts the
prototype and the explicit fidelity instruction for this feature.

## Resolved unknowns summary

| Area | Resolution |
|---|---|
| Component rendering | Custom themed RN primitives (R1) — deviates from `mobile/CLAUDE.md` default, justified above |
| Navigation | Expo Router, file-based, migrated now (R2) |
| Client/session state | Zustand + `persist`/AsyncStorage (R3) |
| Localization | Extend existing hand-rolled provider (R4) |
| Fonts | `@expo-google-fonts/urbanist` (R5) |
| Animation | Reanimated + Gesture Handler — **requires dev-client, breaks Expo Go** (R6) |
| Icons | `@expo/vector-icons` (R7) |
| Gradients/blur/SVG | `expo-linear-gradient`, `expo-blur`, `react-native-svg` (R8) |
| Mock auth/session data | Dedicated mock repository module (R9) |
| Onboarding Skip | Included, correcting the design doc's stated default (R10) |

No `[NEEDS CLARIFICATION]` markers remain.
