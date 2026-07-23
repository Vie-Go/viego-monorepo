---
title: "Components"
description: "Inventory of VieGo's reusable React Native components — core UI, navigation, and map — with their design specs."
---

# Components

The reusable building blocks behind every [screen](../screens/). These mirror the prototype's
component set (the sidebar in [`prototype/index.html`](../../../../../prototype/index.html)) and
follow the [design system](../design-system.md). Shared primitives live in `shared/ui`;
feature-specific compositions live under each `features/*/components`.

| Group | Components | Spec |
|-------|-----------|------|
| **Core UI** | Button · IconButton · Input · Card · Chip · StreakBadge · Avatar · Toggle · Segmented (→nav) · ListRow / SpotRow · SelectRow · SocialAuthButton · StatTile · ProgressBars · Confetti · Divider | [core.md](core.md) |
| **Navigation & chrome** | BottomTabBar · ScreenHeader · BackButton · BottomSheet · SegmentedControl | [navigation.md](navigation.md) |
| **Map** | VnMap · MapProvincePath · MapPin · MapCluster · HeatLegend | [map.md](map.md) |

## Conventions

- **Tokens only.** Components read color/space/type/radius/shadow from
  [`useTheme()`](../design-system.md#tokens) — no inline literals.
- **Theme + locale.** Every component renders in light + dark and never hard-codes a
  user-facing string ([localization](../localization.md)).
- **Pressable, not hover.** Interactions use `Pressable` with a `pressed` style (scale `0.97` +
  opacity) and `android_ripple`; there is no hover on mobile.
- **Motion with consent.** Animated components accept the reduced-motion state and degrade to
  their end state ([animation catalogue](../design-system.md#animation-catalogue)).
- **A11y baked in.** Each spec states `accessibilityRole`, label source, and state exposure;
  targets are ≥ 44×44 px.
- **Prop-driven states.** Specs list the props/variants a component must support so screens can
  compose them without restyling.
