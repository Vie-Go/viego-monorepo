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
| [Screens](screens/) | Per-screen specs, grouped by feature module (identity, exploration, content, engagement, social) |
| [Components](components/) | Per-component specs (core UI, navigation, map) |

## Screen map

Screens are grouped by the five [bounded contexts](../software-architecture-document/ddd-and-domain-model.md)
so this document lines up 1:1 with the
[frontend architecture](../software-architecture-document/frontend-architecture.md) and the
[delivery phases](../../../02-process-documentation/plans-estimates-schedules.md).

| Module | Screens | Spec |
|--------|---------|------|
| **Identity** | Language Select · Log in · Register · Onboarding · Profile & Preferences | [screens/identity.md](screens/identity.md) |
| **Exploration** | Map Home · Province Sheet · Search · Place Detail · Collection ("Your Vietnam") | [screens/exploration.md](screens/exploration.md) |
| **Content** | Snap/Camera Capture · Send Beat · Beat Sent · Beat Detail Modal · Memories | [screens/content.md](screens/content.md) |
| **Engagement** | Milestone Celebration · Notifications · Streak surfaces | [screens/engagement.md](screens/engagement.md) |
| **Social** | Friend Feed (Beats) · Discover · Add Friends · Share Link Modal | [screens/social.md](screens/social.md) |

## Navigation model

```
RootNavigator
├── AuthStack        Language → Log in / Register → Add friends → Onboarding   [identity + social]
└── AppTabs (floating bottom bar + center camera)
    ├── Map          interactive map, province sheet, place              [exploration]
    ├── Beats        friend feed                                         [social]
    ├── (Camera)     center → capture ritual (Snap → Send → Sent)        [content]
    ├── Discover     public feed + search                                [social + exploration]
    └── Me           profile, invite link, collection, preferences       [identity]
Modal / pushed: Place Detail · Search · Notifications · Camera · Send Beat · Beat Sent · Milestone ·
Beat Detail Modal · Memories · Share Link Modal
```

The bottom tab bar shows on Map · Beats · Discover · Me. Capture surfaces (Snap → Camera → Send →
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

> Prototype note: the [reference build](../../../../prototype/VieGo.dc.html) is branded "viego" and
> **is authoritative** for product logic, screens, and features. VieGo ports its visual language and
> interaction model 1:1; product naming (Explorer, **Beat** = photo check-in, province **unlock** via
> first capture, **Audience**, **Streak**, **Place**) follows the
> [domain model](../software-architecture-document/ddd-and-domain-model.md).
