---
title: "Components — Navigation & chrome"
description: "Bottom tab bar, screen header, back button, bottom sheet, and segmented control."
---

# Components — Navigation & chrome

Navigation and screen-frame components. These wrap React Navigation and provide the consistent
chrome across [screens](../screens/).

---

## BottomTabBar

The floating, blurred bottom navigation with a raised center camera FAB. Shows on **Map ·
Beats · Explore · Me**; hidden across the capture flow and full-screen surfaces.

- **Shape.** Absolutely positioned, 18px side insets, ~26px above the home indicator; height 66;
  `radius.pill` (33); `navBg` fill with `BlurView` (blur 16); `shadow.card`; 1.5px `line`
  border. Five slots: Map, Beats, **Camera FAB** (center), Explore, Me.
- **Tab item.** Pill (height 44); **active** = `pill` fill + `pillText` icon **and its label**
  ("Map"/"Beats"/"Explore"/"Me"); **inactive** = transparent + `sub` icon, no label. Icon swaps
  linear→bold on active.
- **Camera FAB.** 56px crimson circle, white camera icon, `translateY(-10)` to overhang, 4px
  `bg` border ring, crimson glow — always present; opens [Camera](../screens/engagement.md#camera-capture).
- **RN notes.** Custom `tabBar` in a `BottomTabNavigator`; the FAB is a center button that
  triggers a modal navigation rather than a tab route. Respect safe-area bottom inset. Hide via
  per-screen `tabBarStyle`/options on capture + detail screens.
- **A11y.** Each tab `accessibilityRole="tab"` + `selected` state; FAB
  `accessibilityRole="button"` labeled "Capture". Active tab exposes its label even when
  visually icon-only for inactive tabs.

## ScreenHeader

Standard top-of-screen header for pushed screens (Notifications, Search, Send Beat).

- **Shape.** Safe-area top inset; a row with an optional leading
  [BackButton](#backbutton), a title (headline/title weight), and an optional trailing slot;
  variants for light content (over dark capture surfaces) and default.
- **Props.** `title`, `onBack?`, `trailing?`, `variant` (`default` | `onDark`).
- **A11y.** Title is an `accessibilityRole="header"`; back button labeled "Back".

## BackButton

- **Shape.** 42px [IconButton](core.md#iconbutton) with a left-arrow; `surface` (default) or
  `overlay`/`overlayDark` over media/camera.
- **Props.** `onPress`, `variant`.
- **A11y.** Label "Back", `accessibilityRole="button"`.

## BottomSheet

Draggable sheet used for the [Province Sheet](../screens/exploration.md#province-sheet) (and any
future contextual sheet).

- **Shape.** `card` fill, `shadow.card`, rounded top (`radius.lg`+), a grab handle; rises with
  `vbSlideUp` (cubic-bezier) from the bottom over dimmed content; snap points ~45% / 85%;
  drag-down + backdrop tap dismiss.
- **RN notes.** Use `@gorhom/bottom-sheet` or a Reanimated + `react-native-gesture-handler`
  implementation. Content scrolls inside. Provide `snapPoints`, `onClose`, `backdrop`.
- **A11y.** `accessibilityViewIsModal`; move focus in on open, restore on close; expose a close
  action.

## SegmentedControl

Two-option toggle (Friends / Public on [Send Beat](../screens/engagement.md#send-beat)).

- **Shape.** Pill track (`rgba(255,255,255,0.08)` on dark), 2 equal segments; **selected** =
  `palette.gold` fill + `palette.onGold` text; **unselected** = transparent + muted text; 0.2s
  fill transition.
- **Props.** `options`, `value`, `onChange`.
- **A11y.** `accessibilityRole="tablist"`; each segment a `tab` with `selected` state.
