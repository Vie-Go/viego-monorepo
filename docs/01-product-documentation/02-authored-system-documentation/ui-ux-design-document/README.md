---
title: "UI/UX Design Document"
description: "Screen-by-screen and component-by-component design specifications for the VieGo React Native app, derived from the prototype."
---

# UI/UX Design Document

How VieGo looks, feels, and behaves — specified for build. The canonical visual source is
[`DESIGN.md`](../../../../DESIGN.md) ("The Crimson Heritage Map") and the interactive
reference is [`prototype/`](../../../../prototype/) (a "viego" HTML/CSS build). This
document translates both into **React Native** design specifications: every screen and every
component, with layout anatomy, tokens, states, animations, i18n, and accessibility notes.

## Sections

| Doc | Covers |
|-----|--------|
| [Design System](design-system.md) | Tokens, component rules, and the **prototype → React Native** translation layer |
| [Localization](localization.md) | Vietnamese/English parity and content localization |
| [Screens](screens/) | Per-screen specs, grouped by feature module (identity, exploration, engagement, content) |
| [Components](components/) | Per-component specs (core UI, navigation, map) |

## Screen map

Screens are grouped by the four [bounded contexts](../software-architecture-document/ddd-and-domain-model.md)
so this document lines up 1:1 with the
[frontend architecture](../software-architecture-document/frontend-architecture.md) and the
[delivery phases](../../../02-process-documentation/plans-estimates-schedules.md).

| Module | Screens | Spec |
|--------|---------|------|
| **Identity** | Language Select · Onboarding · Log in · Register · Profile & Preferences · Notifications | [screens/identity.md](screens/identity.md) |
| **Exploration** | Map Home · Province Sheet · Search · Discover / Explore · Collection ("Your Vietnam") | [screens/exploration.md](screens/exploration.md) |
| **Engagement** | Camera Capture · Send Beat · Beat Sent · Milestone Celebration · Friend Feed · Streak surfaces | [screens/engagement.md](screens/engagement.md) |
| **Content** | POI / Heritage Detail · Cultural Beats · Trivia | [screens/content.md](screens/content.md) |

## Navigation model

```
RootNavigator
├── AuthStack        Language → Onboarding → Log in / Register     [identity]
└── AppTabs (floating bottom bar + center camera FAB)
    ├── Map          interactive map, province sheet, unlock       [exploration]
    ├── Beats        friend feed                                   [engagement]
    ├── (Camera)     center FAB → capture ritual                   [engagement]
    ├── Explore      discovery / search                            [exploration]
    └── Me           profile, collection, preferences              [identity]
Modal / pushed: POI Detail · Search · Notifications · Camera · Send Beat · Beat Sent · Milestone
```

The bottom tab bar shows on Map · Beats · Explore · Me. Capture surfaces (Camera → Send →
Sent → Milestone) run full-screen and dark. See [BottomTabBar](components/navigation.md#bottomtabbar).

## Experience principles

- **Crimson & gold anchor** — primary crimson `#BE382A` for actions, gold `#F2B72F` for
  streaks and unlocked territory. Never two accents on one control.
- **Organic tactility** — rounded forms (16–27px), ambient shadows, rewarding
  unlock/streak/capture micro-animations.
- **Mobile-first rhythm** — compact single-handed layout, ≥44px touch targets, thumb-reachable
  primary actions.
- **Dual-mode harmony** — seamless light/dark; both themes are first-class, not an afterthought.
- **Motion with consent** — every celebration honours reduced-motion.

## How to read a screen spec

Each screen section follows the same shape so it's build-ready:

1. **Purpose & entry** — what it's for, where it's reached from, where it goes.
2. **Anatomy** — the visual regions, top to bottom.
3. **React Native notes** — components used, navigation, gestures, animations, data.
4. **States** — empty / loading / error / theme / broken-streak variants.
5. **Tokens** — the design-system values in play.
6. **i18n & a11y** — translation keys and accessibility requirements.

> Prototype note: the reference build is branded "viego" and models a photo "beat" capture
> ritual. VieGo keeps the same visual language and interaction model; product naming
> (Explorer, province **unlock**, Cultural Beats) follows the
> [domain model](../software-architecture-document/ddd-and-domain-model.md). Each spec calls
> out where the prototype and the product vocabulary differ.
