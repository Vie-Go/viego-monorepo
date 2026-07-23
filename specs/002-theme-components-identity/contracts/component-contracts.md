# Component Base — Contract

This feature's "interface" is the **component library's public props/behavior contract**, not a
network API — there is no backend call in this feature (FR-020). Full visual/behavioral spec for
each lives in the [UI/UX Design Document](../../../docs/01-product-documentation/02-authored-system-documentation/ui-ux-design-document/components/);
this file records which components this feature delivers **fully wired into a real screen** versus
**built to spec but not yet wired anywhere** (per the spec's Assumption that "components base"
covers the full shared set, not just what Identity screens use directly).

Every component MUST: read tokens via the shared theme hook (never inline hex/spacing), match the
prototype (`prototype/VieGo.dc.html`) pixel-for-pixel per [research.md](../research.md) R1, meet the
≥44×44px touch target rule, and expose accessible roles/labels/states per its design-doc entry.

## Wired into a real screen this feature

| Component | Used by | Prop contract source |
|---|---|---|
| Button (primary / ghost) | Language Select, Log in, Register, Onboarding | [components/core.md#button](../../../docs/01-product-documentation/02-authored-system-documentation/ui-ux-design-document/components/core.md#button) |
| Input | Log in, Register | [components/core.md#input](../../../docs/01-product-documentation/02-authored-system-documentation/ui-ux-design-document/components/core.md#input) |
| SelectRow | Language Select | [components/core.md#selectrow](../../../docs/01-product-documentation/02-authored-system-documentation/ui-ux-design-document/components/core.md#selectrow) |
| SocialAuthButton | Log in, Register | [components/core.md#socialauthbutton](../../../docs/01-product-documentation/02-authored-system-documentation/ui-ux-design-document/components/core.md#socialauthbutton) |
| ProgressBars | Onboarding | [components/core.md#progressbars](../../../docs/01-product-documentation/02-authored-system-documentation/ui-ux-design-document/components/core.md#progressbars) |
| IconButton | password show/hide, onboarding skip | [components/core.md#iconbutton](../../../docs/01-product-documentation/02-authored-system-documentation/ui-ux-design-document/components/core.md#iconbutton) |
| Divider | Log in / Register "or continue with" | [components/core.md#divider](../../../docs/01-product-documentation/02-authored-system-documentation/ui-ux-design-document/components/core.md#divider) |

## Built to spec, not wired into any screen this feature (foundation for later features)

| Component | Design-doc source | First consumer (later feature) |
|---|---|---|
| Card | [components/core.md#card](../../../docs/01-product-documentation/02-authored-system-documentation/ui-ux-design-document/components/core.md#card) | Profile & Preferences |
| Chip | [components/core.md#chip](../../../docs/01-product-documentation/02-authored-system-documentation/ui-ux-design-document/components/core.md#chip) | Exploration (Discover filters) |
| StreakBadge | [components/core.md#streakbadge](../../../docs/01-product-documentation/02-authored-system-documentation/ui-ux-design-document/components/core.md#streakbadge) | Profile & Preferences / Engagement |
| Avatar | [components/core.md#avatar](../../../docs/01-product-documentation/02-authored-system-documentation/ui-ux-design-document/components/core.md#avatar) | Profile & Preferences |
| Toggle | [components/core.md#toggle](../../../docs/01-product-documentation/02-authored-system-documentation/ui-ux-design-document/components/core.md#toggle) | Profile & Preferences (dark-mode switch) |
| ListRow (incl. SpotRow) | [components/core.md#listrow](../../../docs/01-product-documentation/02-authored-system-documentation/ui-ux-design-document/components/core.md#listrow) | Profile & Preferences, Exploration |
| StatTile | [components/core.md#stattile](../../../docs/01-product-documentation/02-authored-system-documentation/ui-ux-design-document/components/core.md#stattile) | Profile & Preferences |
| Confetti | [components/core.md#confetti](../../../docs/01-product-documentation/02-authored-system-documentation/ui-ux-design-document/components/core.md#confetti) | Engagement (milestone) |
| BottomTabBar | [components/navigation.md#bottomtabbar](../../../docs/01-product-documentation/02-authored-system-documentation/ui-ux-design-document/components/navigation.md#bottomtabbar) | Whichever feature ships the first real tab |
| ScreenHeader / BackButton | [components/navigation.md#screenheader](../../../docs/01-product-documentation/02-authored-system-documentation/ui-ux-design-document/components/navigation.md#screenheader) | Exploration (Search, Notifications) |
| BottomSheet | [components/navigation.md#bottomsheet](../../../docs/01-product-documentation/02-authored-system-documentation/ui-ux-design-document/components/navigation.md#bottomsheet) | Exploration (Province Sheet) |
| SegmentedControl | [components/navigation.md#segmentedcontrol](../../../docs/01-product-documentation/02-authored-system-documentation/ui-ux-design-document/components/navigation.md#segmentedcontrol) | Content (Send Beat) |

Components in this second table still need a unit test proving they render/behave per their
contract (states, a11y roles, token usage) even with no live screen consumer — "built to spec" does
not mean untested.

## Mock data contract

See [data-model.md](../data-model.md) for the `Explorer` / `Session` / `LanguagePreference` /
`Theme` shapes the mock repository (R9) and Zustand stores expose. No field or method in this layer
makes a network call; a later feature swaps the mock repository's internals for real API calls
without changing any component or screen's props.
