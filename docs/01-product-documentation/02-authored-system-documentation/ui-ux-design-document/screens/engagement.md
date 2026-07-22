---
title: "Screens — Engagement"
description: "The daily capture ritual (camera → send → sent → milestone), the friend feed, and streak surfaces — the Engagement module screens."
---

# Screens — Engagement

The [Engagement module](../../software-architecture-document/design/engagement.md) screens: the
daily **streak** ritual and the social feed it feeds into. The capture flow (Camera → Send →
Sent → Milestone) is the "discovery ritual" that advances a streak and, in the product,
triggers the province **unlock**. Built in `features/engagement/screens`. Delivered in
[Phase 3](../../../../02-process-documentation/plans-estimates-schedules.md#phase-3--engagement-streaks-weeks-1011).

The capture surfaces are **full-screen dark** (`#0D0909`) regardless of theme — a deliberate
"camera mode". The bottom tab bar is hidden throughout the flow.

---

## Camera Capture

**Purpose & entry.** Opens the camera to capture today's beat. Reached from the center
**camera FAB** in the [tab bar](../components/navigation.md#bottomtabbar), the
[Province Sheet](exploration.md#province-sheet) "Check in here", the
[POI Detail](content.md#poi--heritage-detail) "Capture here", or the streak-broken banner.
Snap → [Send Beat](#send-beat).

**Anatomy.** Dark screen: top row — close [IconButton](../components/core.md#iconbutton) +
centered **auto-tag** chip (gold-tint, location pin, "{Spot — Province}", "auto-tag"); a large
rounded camera preview with corner framing guides; a "Day N — keep it burning" streak line;
bottom controls — gallery thumbnail, 80px **shutter** (white ring, crimson core, press-scale),
and a flip-camera button.

**React Native notes.** Camera via `expo-camera` (`CameraView`); request permission on entry
with a rationale sheet and a denied-state fallback (open Settings). The auto-tag comes from
device location + the carried province/spot context (reverse-geocode or nearest known spot).
Shutter press animates scale `0.85`, captures a still, then routes to Send with the photo URI.
Gallery button opens `expo-image-picker`. Keep the flow dark; use `StatusBar` light content.

**States.** Permission-pending / granted (live preview) / denied (placeholder + "Enable camera"
CTA). Location on/off (auto-tag shows tag or "Add location"). Streak day N reflects
current+1.

**Tokens.** Fixed dark palette (not theme-driven); auto-tag `rgba(242,183,47,0.14)` + gold;
shutter core `palette.primary`.

**i18n & a11y.** Keys `engagement.camera.autoTag`, `.dayHint`, `.permission.title`, `.enable`.
Shutter `accessibilityLabel="Capture"`, `accessibilityRole="button"`; flip + gallery labeled.

---

## Send Beat

**Purpose & entry.** Compose + choose audience for the captured beat. Reached from
[Camera](#camera-capture) (back returns to camera). Send → [Beat Sent](#beat-sent).

**Anatomy.** Dark screen: header (back + "Send your beat"); a tilted capture **preview card**
(`vbPop` in) with the location tag; an optional caption field ("Thêm caption…"); a
**Friends / Public** [SegmentedControl](../components/navigation.md#segmentedcontrol);
audience body — for Friends, a horizontal picker of friend
[Avatar](../components/core.md#avatar)s (gold ring + check when selected); for Public, a globe
note ("Everyone exploring this spot will see your beat as social proof."); a gold **Send** pill
("Send to N bạn" / "Post publicly").

**React Native notes.** Caption is a `TextInput` over the dark surface. Segmented control drives
which body renders. Friend selection is multi-select local state; send count updates the CTA
label. Send is a mutation that creates the beat, advances the streak (`StreakAdvanced`), and —
in the product — grants the province unlock; on success route to Sent. Handle the offline queue
per the [frontend offline strategy](../../software-architecture-document/frontend-architecture.md#data--state).

**States.** Friends (≥1 must be selected to send, or allow 0? — product default: allow, becomes
"just me") vs. Public; caption empty/filled; sending (spinner in CTA).

**Tokens.** Dark surfaces `rgba(255,255,255,0.08)`; selected friend ring `palette.gold`; Send
pill `palette.gold`/`onGold` with gold glow.

**i18n & a11y.** Keys `engagement.send.title`, `.captionPlaceholder`, `.audience.friends`,
`.audience.public`, `.publicNote`, `.sendToFriends`, `.postPublicly`. Segmented control
`accessibilityRole="tablist"`; friend avatars are toggle buttons with selected state.

---

## Beat Sent

**Purpose & entry.** Success confirmation after sending. Auto-context to
[Milestone](#milestone-celebration) when the streak hits a milestone, else back to the
[Feed](#friend-feed). "Keep exploring" dismisses.

**Anatomy.** Centered dark screen: 96px gold **check** badge (`vbPop`); "Beat sent!"
(display/800, white); a summary line ("Landed on N friends' home maps" / "Live on the public
map for this spot") + the location tag; a streak pill card ("Day N", note e.g. "Milestone
reached!" / "Personal best: 21"); a ghost "Keep exploring" button.

**React Native notes.** Pure confirmation screen; no data entry. The streak note is derived
(broken-relit vs. milestone vs. best). "Keep exploring" routes to Milestone if
`streak` crossed a threshold, otherwise Feed. Auto-advance after ~a few seconds is optional
(keep manual for accessibility).

**States.** Friends vs. public summary; milestone-reached vs. normal vs. relit-after-break.

**Tokens.** Fixed dark; check badge `palette.gold`/`onGold`; streak card `rgba(255,255,255,0.07)`.

**i18n & a11y.** Keys `engagement.sent.title`, `.summaryFriends`, `.summaryPublic`,
`.streakNote.milestone`, `.streakNote.best`, `.streakNote.relit`, `.keepExploring`. Announce
"Beat sent" via live region; success not conveyed by color alone (icon + text).

---

## Milestone Celebration

**Purpose & entry.** Full-screen reward when the streak reaches a milestone (e.g. 7 days).
Reached from [Beat Sent](#beat-sent). Continue → [Feed](#friend-feed).

**Anatomy.** Radial gold background; falling **confetti**
([Confetti](../components/core.md#confetti)); a 120px white circle with a crimson flame
(`vbPop`); a huge streak number (76/800); "day streak!"; a bilingual congratulation; a
**badge-unlocked** card (icon + "Badge unlocked: '{name}'" + subtitle); an ink "Tiếp tục"
button.

**React Native notes.** Background is a `RadialGradient` (react-native-svg) or layered linear
gradients. Confetti = N absolutely-positioned pieces each with a staggered `vbFall` repeat.
**Entire screen honours `useReducedMotion()`** — when reduced, drop confetti + pop and present
a static congratulation. Badge data comes from the engagement milestone/reward surface.

**States.** Milestone tiers change the number, copy, and badge. Reduced-motion static variant.

**Tokens.** Fixed gold gradient; flame circle white on gold; continue button ink `#231A08`.

**i18n & a11y.** Keys `engagement.milestone.dayStreak`, `.congrats`, `.badgeUnlocked`,
`.continue`; badge name/subtitle server-localized. Confetti `accessibilityElementsHidden`;
milestone announced as text.

---

## Friend Feed

**Purpose & entry.** The **Beats** tab — a live feed of friends' captures. Reached from the tab
bar and after the capture flow. Streak-broken banner offers a relight.

**Anatomy.** Title "Beats" + [StreakBadge](../components/core.md#streakbadge); subtitle "Fresh
from your bạn bè, as it happens"; a streak-broken banner (conditional, "Relight" → Camera); a
**hero moment** card (large, author + place + time overlays, bolt/heart quick actions) followed
by a 2-column grid of smaller moment cards.

**React Native notes.** `FlatList` (or masonry) — hero as `ListHeaderComponent`, grid as the
data. Media via `expo-image`. Quick actions (bolt = hype, heart = like) are optimistic
mutations. Pull-to-refresh; new-beats-since indicator optional. Bottom padding clears the tab
bar (~120px).

**States.** Loading skeletons; empty ("Chưa có beat nào — follow friends to see their beats");
streak active vs. broken banner.

**Tokens.** Cards `radius.lg`/`radius.md`; overlays `rgba(13,9,9,0.72)`; fresh author ring
`palette.gold`.

**i18n & a11y.** Keys `engagement.feed.title`, `.subtitle`, `.streakLost`, `.relight`,
`.empty`. Time-ago localized via the i18n lib. Cards summarize author + place + time for screen
readers; quick-action buttons labeled.

---

## Streak surfaces (shared)

Not a screen — the streak appears across the app and must stay consistent:

- **[StreakBadge](../components/core.md#streakbadge)** — Map header, Feed header, Profile stat.
  Active = gold-tint + `goldDeep` flame + count; broken = `surface` + muted + 0.
- **Broken banner** — Map + Feed; crimson-tint prompt → relight via Camera.
- **Week strip** — Profile "This week"; 7 day-dots gold when that day's ritual is done.
- **Camera streak line** + **Sent streak card** + **Milestone** — the reward arc above.

All streak data flows from `['engagement','streak']`; a successful send invalidates it so every
surface updates together. Day/timezone rules follow the
[engagement design](../../software-architecture-document/design/engagement.md) (the "day"
boundary + break evaluation is an [open product decision](../../../../02-process-documentation/plans-estimates-schedules.md#open-product-decisions-resolve-before-the-phase-that-needs-them)).
