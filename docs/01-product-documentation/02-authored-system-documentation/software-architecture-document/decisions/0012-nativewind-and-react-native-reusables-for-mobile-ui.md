---
title: "ADR 0012 — NativeWind + React Native Reusables for the mobile UI component base"
description: "The mobile component library is styled with NativeWind and built from React Native Reusables' accessible primitives, superseding @expo/ui as the default for new components."
---

# ADR 0012 — NativeWind + React Native Reusables for the mobile UI component base

- **Status:** Accepted · **Date:** 2026-07-23 · **Deciders:** VieGo team
- **Supersedes:** the informal "default to `@expo/ui`" guidance previously stated in
  [`mobile/CLAUDE.md`](../../../../../mobile/CLAUDE.md) (that guidance was never itself recorded as
  an ADR — this fills that gap and changes the answer).
- **Refines:** [ADR 0003](0003-react-native-for-mobile.md) (React Native) and
  [ADR 0008](0008-expo-and-eas-toolchain.md) (Expo + EAS toolchain) within that stack.

## Context

[`mobile/CLAUDE.md`](../../../../../mobile/CLAUDE.md) previously directed new screens/components to
default to **`@expo/ui`** — Expo's universal component set that renders real SwiftUI on iOS and real
Jetpack Compose on Android. That guidance was never backed by its own ADR, and it predates the
[UI/UX Design Document](../../ui-ux-design-document/) being treated as build-ready: the
[design system](../../ui-ux-design-document/design-system.md) and every
[component](../../ui-ux-design-document/components/)/[screen](../../ui-ux-design-document/screens/)
spec define one custom, cross-platform-identical brand skin (crimson/gold palette, specific radii,
`shadow.glow`, Urbanist typeface) ported 1:1 from the [interactive prototype](../../../../../prototype/VieGo.dc.html).

`@expo/ui` cannot render that skin: by design, its components *are* each platform's native controls
— a `@expo/ui` `Switch` is an OS switch, a `@expo/ui` `Button` is an OS button, styled per iOS/
Android HIG conventions, not a shared custom design. Building
[002-theme-components-identity](../../../../../specs/002-theme-components-identity/) (the theme +
component-base foundation feature) surfaced this directly: following the design system's
prototype-fidelity requirement and following `@expo/ui` as the default are mutually exclusive.

## Decision

- **Styling: NativeWind v4** (Tailwind-style utility classes compiled onto plain `View`/`Pressable`/
  `Text` — not native OS chrome), themed with a VieGo-specific Tailwind config encoding the design
  system's tokens (palette, radius, spacing, font, shadow) once, for utility-class use across the
  whole component base.
- **Component starting point: React Native Reusables (RNR)** — copy-paste components (owned in this
  repo, not an opaque dependency, same model as shadcn/ui) built on accessible, unstyled
  `@rn-primitives/*` packages (`switch`, `radio-group`, `select`, `toggle`, `dialog`, `progress`,
  `avatar`, `checkbox`, `accordion`, `tabs`, `tooltip`, `toast`, `separator`, `slider`, and more),
  restyled to the VieGo Tailwind theme to match the prototype exactly. Components with no
  `@rn-primitives` equivalent (e.g. the branded `Button`, `StreakBadge`, gesture-driven
  `BottomSheet`) are hand-built directly on NativeWind-styled RN views.
- **`@expo/ui` is no longer the default.** It remains available for a genuinely platform-only,
  no-brand-equivalent affordance (a native share sheet, a system permission prompt) where there is no
  design-system component to match — but it is the exception now, not the starting point.
- Components live in `mobile/app/shared/ui/` (unchanged location/convention from before this ADR).

Full rationale, verified version compatibility (React 19.2.3 exact match, RN 0.85.3 vs. this
project's 0.86.0, Expo ^56 vs. ~57, NativeWind 4.2.6 latest, `react-native-reanimated` ~4.3.1 — all
checked directly against React Native Reusables' own showcase app rather than assumed), and the
full primitive-to-component mapping are in
[research.md](../../../../../specs/002-theme-components-identity/research.md) R1 and
[contracts/component-contracts.md](../../../../../specs/002-theme-components-identity/contracts/component-contracts.md).

## Consequences

- **+** Every component can match `prototype/VieGo.dc.html` pixel-for-pixel on both platforms —
  the one thing `@expo/ui` structurally cannot do.
- **+** RNR's underlying primitives give working, accessible (role/state/keyboard) interaction
  behavior for controls this and later features need, for less first-party code than hand-rolling
  every control's behavior from scratch.
- **+** Components are copied into the repo, not `npm install`-and-forget — full styling control is
  retained, same as fully hand-rolling, just starting from tested behavior instead of zero.
- **−** Adds a Tailwind/NativeWind build-tooling layer (babel + metro plugin, `tailwind.config.js`)
  to a codebase that was plain `StyleSheet` before.
- **−** RNR/`@rn-primitives` is a newer, smaller ecosystem than hand-rolled React Native or
  `@expo/ui`; no dedicated bottom-sheet/drawer primitive exists there, so the gesture-driven
  `BottomSheet` (Province Sheet) stays a bespoke Reanimated + Gesture Handler build regardless of
  this decision.
- **−** `mobile/CLAUDE.md`'s "Before writing any `@expo/ui` tree, load the `expo:expo-ui` skill"
  guidance now applies only to the exception case, not the common path; the common path instead
  loads NativeWind/RNR setup guidance (`expo:expo-tailwind-setup`) at implementation time.
- No Expo Go regression: this decision does not require a development-client build — Reanimated,
  Gesture Handler, and the other native-code packages this feature adds are all officially
  "Included in Expo Go" per Expo's own SDK reference (verified, not assumed).

## Alternatives

- **Keep `@expo/ui` as the default** — rejected: cannot reproduce the prototype's custom
  cross-platform brand skin at all; would mean the design system's prototype-fidelity requirement is
  simply unmeetable for any branded control.
- **Fully hand-rolled `StyleSheet` primitives, no NativeWind/RNR** — still viable (this project's
  original plan before this ADR), but re-implements accessible interaction behavior for every control
  from scratch. Rejected in favor of starting from RNR's tested primitives, at the cost of the added
  build-tooling layer.
- **Hybrid** (`@expo/ui` for generic layout, NativeWind/RNR for branded controls) — rejected: the
  whole component set is brand-specific in the design system, so splitting rendering strategies
  mid-library adds inconsistency for no benefit.

See [`mobile/CLAUDE.md`](../../../../../mobile/CLAUDE.md) for the engineering rules this decision
drives day to day.
