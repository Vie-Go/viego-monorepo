---
title: "Components — Core UI"
description: "Buttons, inputs, cards, chips, badges, avatars, toggles, list rows, and other core React Native primitives."
---

# Components — Core UI

Shared primitives in `shared/ui`, encoding the [design system](../design-system.md). Each reads
tokens via `useTheme()` and supports light + dark. Anchors below are linked from the
[screen specs](../screens/).

---

## Button

Full-pill action button. Variants: **primary** (crimson + glow), **action** (gold, ink text),
**ghost** (bordered, no fill).

- **Shape.** Height 54, `radius.full` (27); horizontal padding `space.lg`; centered label
  (bold 16) with optional leading icon (`space.sm` gap).
- **Primary.** `palette.primary` fill, white text, `shadow.glow`. Pressed → `palette.primaryHover`
  + scale `0.97`.
- **Action.** `palette.gold` fill, `palette.onGold` text, gold-tinted shadow — for streak /
  positive commits (Send, Get started).
- **Ghost.** Transparent fill, 1.5px `line` border, `text` label. No shadow.
- **Props.** `variant`, `label`, `iconLeft?`, `loading?`, `disabled?`, `onPress`, `fullWidth?`.
- **States.** Idle / pressed / loading (spinner replaces label, stays sized) / disabled (60%
  opacity, no shadow).
- **A11y.** `accessibilityRole="button"`, `accessibilityState={{disabled,busy}}`; label is the
  accessible name.
- **Rule.** Glow (`shadow.glow`) is **primary only** — never on action/ghost or containers.

## IconButton

Circular icon-only control (back, close, bell, like, bookmark, flip).

- **Shape.** 42px (32px compact) circle, `surface` fill, centered icon (18–20). Overlay variant:
  `rgba(255,255,255,0.92)` on media, or `rgba(255,255,255,0.1)` on dark camera surfaces.
- **Props.** `icon`, `size?`, `variant` (`surface` | `overlay` | `overlayDark`), `badge?`
  (unread dot), `onPress`.
- **A11y.** Requires an explicit `accessibilityLabel` (icon has no text); `accessibilityRole="button"`.

## Input

Single-line text field.

- **Shape.** Height 52, `radius.md`, 1.5px `line` border, `surface` fill, 18px horizontal
  padding; text body 14.5/600 `text`; placeholder `sub`.
- **Focus.** Border → `palette.primary` (`onFocus`/`onBlur` toggles the token); no OS outline.
- **Props.** `value`, `onChangeText`, `placeholder`, `keyboardType?`, `secureTextEntry?`,
  `autoCapitalize?`, `textContentType?`, `leadingIcon?`, `trailingSlot?` (e.g. password
  show/hide), `error?`.
- **States.** Idle / focus / filled / error (border `palette.primary` + helper text) /
  disabled.
- **A11y.** Labeled via `accessibilityLabel` or an associated visible label; error text in a
  live region; password toggle labeled.

## Card

Elevated content container (discovery cards, info cards, sheets-as-cards).

- **Shape.** `radius.md`–`radius.lg`, `card` fill, `shadow.card` ambient elevation; inner
  padding `space.md`.
- **Props.** `padded?`, `onPress?` (tappable cards become `Pressable`), `children`.
- **A11y.** Tappable cards get `accessibilityRole="button"` + a summary label.

## Chip

Category / filter pill.

- **Shape.** Height 34–36, pill radius, horizontal padding ~15; label 13/700; horizontal
  scroller, `flex-shrink:0`.
- **Selected.** `pill` fill + `pillText` text (+ matching border). **Unselected.** `surface`
  fill + `sub` text + `line` border.
- **Props.** `label`, `selected`, `onPress`.
- **A11y.** `accessibilityRole="button"` + `accessibilityState={{selected}}`; group behaves like
  a filter set.

## StreakBadge

The streak count pill used on Map, Feed, and Profile.

- **Active.** `rgba(242,183,47,0.18)` fill, `goldDeep` flame icon, `text` count; height 36 pill.
- **Broken.** `surface` fill, muted flame + `sub` count (0).
- **Milestone variant.** Solid `palette.gold` fill + ink — for celebratory contexts.
- **Props.** `count`, `broken?`, `milestone?`, `pulse?` (beat-pulse on the flame,
  reduced-motion aware).
- **A11y.** Label "N day streak" / "streak broken"; not color-only.

## Avatar

Circular user image / initial.

- **Shape.** Circle (30 / 38 / 52 / 92 px scales); image or colored initial fallback; optional
  gold ring (3px) for self/fresh; optional status check badge (bottom-right).
- **Props.** `source? | initial`, `size`, `ring?`, `badge?`.
- **A11y.** Label = person's name; decorative when adjacent text already names them
  (`accessibilityElementsHidden`).

## Toggle

On/off switch (dark-mode preference).

- **Shape.** 46×28 track, 22px white knob; off → `line` track, knob left; on → `palette.primary`
  track, knob right; 0.25s slide.
- **Props.** `value`, `onValueChange`.
- **A11y.** `accessibilityRole="switch"` + `accessibilityState={{checked}}`.

## ListRow

Horizontal list item (settings rows, search results, notifications, spots-in-province). The
**SpotRow** variant is documented here.

- **Shape.** Leading icon tile / thumb (40–44) → title (14/800) + subtitle (`sub`) → trailing
  slot (value, chevron, tag, or time+dot); `line` bottom divider; padding ~13px vertical.
- **Variants.** `SpotRow` (tint thumb + "category · rating" + chevron); notification row (tinted
  icon circle + time + unread dot); settings row (icon + value + chevron / toggle).
- **Props.** `leading`, `title`, `subtitle?`, `trailing?`, `onPress?`.
- **A11y.** Tappable → `accessibilityRole="button"`; compose a single label from title +
  subtitle + state.

## SelectRow

Selectable option row (language picker, settings options).

- **Shape.** Row with leading marker (code chip / letter), label + subtitle, trailing radio dot;
  selected → `palette.primary` border + 6%-crimson fill + filled dot.
- **Props.** `label`, `subtitle?`, `leading?`, `selected`, `onPress`.
- **A11y.** `accessibilityRole="radio"` + `accessibilityState={{selected}}`.

## SocialAuthButton

Circular OAuth provider button (Google / Facebook / Zalo).

- **Shape.** 56px circle, `surface` fill, 1.5px `line` border, brand-tinted glyph (Google red,
  Facebook blue, Zalo blue); row of three under an "or continue with" divider.
- **Props.** `provider`, `disabled?` (until wired — Email+Google P1, Facebook+Zalo fast-follow),
  `onPress`.
- **A11y.** Label "Continue with {provider}"; disabled state announced.

## StatTile

Compact metric tile (profile stats).

- **Shape.** Flex-1 tile, `surface` fill, `radius.lg`, centered value (20/800) + label (11/700
  `sub`); optional leading icon (e.g. streak flame `goldDeep`).
- **Props.** `value`, `label`, `icon?`, `accent?`.
- **A11y.** Single label "value label" (e.g. "6 day streak").

## ProgressBars

Segmented progress (onboarding slides).

- **Shape.** N equal 3px segments, `space.sm` gap; filled = `palette.gold`, unfilled = 35%-white
  (on dark) / `line`.
- **Props.** `count`, `current`.
- **A11y.** `accessibilityValue={{min:0,max:count,now:current+1}}`.

## Confetti

Celebration particles (milestone).

- **Shape.** N absolutely-positioned pieces (mixed colors: white / crimson / ink / cream, square
  + round), each `vbFall` (translateY + rotate) on a staggered repeat.
- **Props.** `count?`, `active`.
- **Motion.** **Fully disabled under reduced motion** (renders nothing).
- **A11y.** `accessibilityElementsHidden` / `importantForAccessibility="no-hide-descendants"`.

## Divider

- **"or continue with"** — 1px `line` rules flanking centered `sub` label.
- **List divider** — 1px `line` bottom border on rows.
