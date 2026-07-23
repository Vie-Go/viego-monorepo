# Phase 0 Research — Theme, Component Base & First-Launch Identity Flow

Each item: **Decision · Rationale · Alternatives considered**. Starting point: `mobile/` already
exists from [Phase 0](../001-phase-0-walking-skeleton/plan.md) with Expo SDK 57, React Native 0.86,
React 19, TypeScript, `@react-navigation/*`, TanStack Query, and hand-rolled `ThemeProvider` /
`I18nProvider` / `shared/ui` primitives — all pre-migration per [`mobile/CLAUDE.md`](../../mobile/CLAUDE.md).

## R1. Component styling foundation — NativeWind + React Native Reusables, NOT `@expo/ui` *(now the standing default — ADR-0012)*

**Decision**: Style the component base with **NativeWind v4** (Tailwind-style utility classes
compiled onto plain `View`/`Pressable`/`Text` — not native OS chrome) and start each interactive
component from **React Native Reusables (RNR)**'s copy-paste source — components built on
accessible, unstyled **`@rn-primitives/*`** packages — restyled with a VieGo-specific Tailwind
theme (colors/radius/spacing/font mapped 1:1 from `design-system.md`'s tokens) to match
`prototype/VieGo.dc.html` exactly. Components are copied into `mobile/app/shared/ui/` (the existing
convention), not consumed as an opaque dependency.

**Rationale**: The user has explicitly, repeatedly directed pixel-fidelity to the live prototype:
exact crimson pill buttons with a colored glow shadow, exact 16–27px radii, exact Urbanist weights,
identical shapes on iOS and Android. `@expo/ui` renders **real SwiftUI on iOS and real Jetpack
Compose on Android** — a hard technical ceiling, not a styling preference: no modifier turns a
`@expo/ui` `Switch` into a custom cross-platform-identical brand skin. NativeWind doesn't have that
ceiling — it's an authoring-syntax choice (utility classes vs. `StyleSheet` objects) on top of the
*same* plain RN primitives the original hand-rolled plan used, so it doesn't reopen the `@expo/ui`
problem. RNR adds real value on top of hand-rolling from scratch: its underlying primitives —
verified present in the `@rn-primitives` source (`roninoss/rn-primitives`): `switch`, `radio-group`,
`select`, `toggle`, `toggle-group`, `checkbox`, `dialog`, `progress`, `avatar`, `accordion`, `tabs`,
`tooltip`, `toast`, `separator`, `slider` — give working, accessible (role/state/keyboard) behavior
for controls this feature and later features need (Toggle, SelectRow-as-radio-group, Chip via
toggle-group, StatTile groupings, Confetti/toast-adjacent patterns), satisfying FR-031/FR-035 with
less bespoke a11y wiring than building every control's interaction logic from raw `Pressable`.
Because components are copied in (shadcn's model, not `npm install`-and-forget), full pixel control
is retained — same customization freedom as hand-rolling, just starting from tested behavior
instead of zero. This is a stack-level UI-kit swap, which `mobile/CLAUDE.md` itself requires be
recorded as an ADR rather than a drive-by refactor — recorded as
[ADR-0012](../../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/decisions/0012-nativewind-and-react-native-reusables-for-mobile-ui.md),
which also amends `mobile/CLAUDE.md` in the same change to make NativeWind/RNR the standing default
for all mobile UI work (superseding `@expo/ui`'s previous default, which itself had never been
formally recorded as an ADR). `@expo/ui` remains available for a genuinely platform-only affordance
with no design-system equivalent — the exception now, not the starting point.

**Verified compatibility** (checked against this session's date, since training data can lag): RNR's
own showcase app (`founded-labs/react-native-reusables`, fetched directly) runs **React 19.2.3** —
an exact match to this project's React 19.2.3 — **React Native 0.85.3** (this project: 0.86.0, one
minor version apart; no native-ABI concern since NativeWind and the `@rn-primitives` packages ship
no native code of their own, only what Reanimated/Gesture Handler already require per R6), **Expo
^56** (this project: ~57, one SDK behind — low risk for JS/babel-level tooling), **NativeWind
^4.2.2** (latest published: 4.2.6, confirmed via the npm registry), and **`react-native-reanimated`
~4.3.1** — meaning R6's Reanimated dependency should target **v4.x**, not v3.x as the design
system doc's older wording implies, to match what RNR's own components are built and tested
against. `@rn-primitives` has **no dedicated bottom-sheet/drawer package** — the design system's
gesture-driven Province Sheet stays a bespoke build (R6, `@gorhom/bottom-sheet` or hand-rolled
Reanimated + Gesture Handler) independent of this decision, which is fine since `BottomSheet` isn't
wired into any screen in this feature ([component-contracts.md](contracts/component-contracts.md)).

**Alternatives considered**:
- **Fully hand-rolled `StyleSheet` primitives** (the original R1 decision) — still viable, but
  re-implements accessible interaction behavior (focus, roles, keyboard, checked/disabled state
  plumbing) from scratch for every control; RNR gets this for less first-party code to write and
  maintain, at the cost of a newer/smaller ecosystem and an added build-tooling layer (Tailwind
  config + babel/metro plugin).
- **`@expo/ui` per the standing default** — rejected: cannot reproduce the prototype's custom
  shapes/shadows/typeface; would mean the "must follow prototype exactly" instruction is simply not
  achievable.
- **Hybrid** (`@expo/ui` for generic layout, custom/NativeWind for branded controls) — rejected:
  the whole component set is brand-specific in the design system, so splitting rendering strategies
  mid-library adds inconsistency for no benefit here.

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

## R6. Animation — Reanimated 4 + Gesture Handler (Expo Go still works — verified)

**Decision**: Add `react-native-reanimated` (**v4.x**, matching R1's verified RNR dependency, not
the v3.x the design doc's older wording implies — install alongside its new peer package
`react-native-worklets`, per Reanimated 4's own install instructions) and
`react-native-gesture-handler` for the animation catalogue (rise-in, pop, beat-pulse, slide-up
sheet, ping) per the design system's Reanimated mapping, all gated on `useReducedMotion()`.
Reanimated 4 requires React Native's New Architecture (Fabric) — already the default on Expo SDK
57 / RN 0.86, so no extra opt-in is needed.

**Rationale**: The design system specifies Reanimated worklets for this exact catalogue.
`mobile/CLAUDE.md` warns that adding native-code packages *can* end Expo Go support and to call it
out explicitly when it happens — so this was checked directly against Expo's own SDK reference
(`docs.expo.dev`, fetched via the `mcp__expo__read_documentation` tool) rather than assumed: **both
`react-native-reanimated` and `react-native-gesture-handler` are explicitly listed "Included in Expo
Go"** in the current (SDK 57) reference, same as `react-native-svg`, `expo-blur`,
`expo-linear-gradient`, and `@react-native-async-storage/async-storage` (all also confirmed
"Included in Expo Go"). **This corrects an earlier draft of this research/plan, which had wrongly
assumed these packages require a dev-client build — they do not; Expo Go continues to work for this
entire feature.** Note Reanimated is layered *on top of* R1's RNR primitives (RNR's own
`accordion`/`collapsible`/`dialog`/`toast` primitives may use Reanimated internally for their own
open/close transitions) — VieGo's specific branded motion (beat-pulse, confetti fall, ping,
slide-up sheet) is bespoke work regardless, since it's not something RNR ships out of the box.

**Alternatives considered**: the core `Animated` API — rejected, cannot cleanly express the
gesture-driven bottom-sheet drag or match the design system's own Reanimated mapping table. (Moot
either way for Expo Go compatibility, since Reanimated itself doesn't require leaving Expo Go.)

## R7. Icons — `lucide-react-native`, substituting for `iconsax-react-native`

**Decision**: Use `lucide-react-native` as the icon source (both for RNR-sourced components'
internal glyphs — Select's chevron, Checkbox's check, Dialog's close X — and for VieGo-specific
prototype icon mappings), mapping each prototype `<v-icon name="…">` to the closest available
glyph, rather than `iconsax-react-native` or `@expo/vector-icons`.

**Rationale**: RNR's own copied components (per its showcase app's dependencies) are authored
against `lucide-react-native` already — adopting it avoids running two icon systems side by side
once R1 pulls RNR components in. Coverage is good for every icon this feature needs (`ArrowLeft`,
`Bell`, `Search`, `MapPin`, `Zap`, `Flame`, `User`, `Eye`/`EyeOff` for password reveal). It's pure
SVG (via `react-native-svg`, already a R8 dependency) with no extra config-plugin cost.

**Alternatives considered**: `@expo/vector-icons` — no longer necessary once RNR (R1) is adopted,
since RNR already makes lucide a transitive necessity for its own components; running both would
mean two icon systems for no benefit. `iconsax-react-native` — still rejected: not an Expo-first
package, adds an unvetted native/SVG dependency for a cosmetic gain lucide already covers well
enough.

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
| Component styling foundation | NativeWind v4 + React Native Reusables (`@rn-primitives`) (R1) — recorded as ADR-0012, now the standing `mobile/CLAUDE.md` default (supersedes `@expo/ui`); compatibility verified against RNR's own showcase app |
| Navigation | Expo Router, file-based, migrated now (R2) |
| Client/session state | Zustand + `persist`/AsyncStorage (R3) |
| Localization | Extend existing hand-rolled provider (R4) |
| Fonts | `@expo-google-fonts/urbanist` (R5) |
| Animation | Reanimated **v4.x** + Gesture Handler — **Expo Go still works, verified against Expo's SDK docs** (R6) |
| Icons | `lucide-react-native` (R7) — matches what RNR components already import |
| Gradients/blur/SVG | `expo-linear-gradient`, `expo-blur`, `react-native-svg` (R8) |
| Mock auth/session data | Dedicated mock repository module (R9) |
| Onboarding Skip | Included, correcting the design doc's stated default (R10) |

No `[NEEDS CLARIFICATION]` markers remain.
