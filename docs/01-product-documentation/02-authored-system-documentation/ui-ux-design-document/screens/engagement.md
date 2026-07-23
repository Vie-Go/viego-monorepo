---
title: "Screens — Engagement"
description: "Milestone celebration, notifications, and the streak surfaces that appear across the app — the Engagement module screens."
---

# Screens — Engagement

The [Engagement module](../../software-architecture-document/design/engagement.md) screens: the
reward and reminder layer around the daily **streak**. Capturing a Beat (in
[Content](content.md)) advances the streak; Engagement celebrates milestones and surfaces
notifications. Built in `features/engagement/screens`. Delivered in
[Phase 4](../../../../02-process-documentation/plans-estimates-schedules.md).

---

## Milestone Celebration

**Purpose & entry.** Full-screen reward when the streak reaches a milestone (e.g. 7 days). Reached
from [Beat Sent](content.md#beat-sent) when the streak crosses a threshold. Continue →
[Feed](social.md#friend-feed).

**Anatomy.** Radial gold background; falling **confetti** ([Confetti](../components/core.md#confetti));
a 120px white circle with a crimson flame (`vbPop`); a huge streak number (76/800); "day streak!"; a
bilingual congratulation; a **badge-unlocked** card (icon + "Badge unlocked: '{name}'" + subtitle); an
ink "Tiếp tục" button.

**React Native notes.** Background is a `RadialGradient` (react-native-svg) or layered linear
gradients. Confetti = N absolutely-positioned pieces each with a staggered `vbFall` repeat. **Entire
screen honours `useReducedMotion()`** — when reduced, drop confetti + pop and present a static
congratulation. Badge data comes from the `MilestoneReached` event / engagement reward surface.

**States.** Milestone tiers change the number, copy, and badge. Reduced-motion static variant.

**Tokens.** Fixed gold gradient; flame circle white on gold; continue button ink `#231A08`.

**i18n & a11y.** Keys `engagement.milestone.dayStreak`, `.congrats`, `.badgeUnlocked`, `.continue`;
badge name/subtitle server-localized. Confetti `accessibilityElementsHidden`; milestone announced as
text.

---

## Notifications

**Purpose & entry.** Chronological activity list (streak reminders, likes, friends' beats, nearby
places, badges). Reached from the [Map Home](exploration.md#map-home) / Snap home bell; the bell shows
an unread dot. Opening marks all read.

**Anatomy.** Header — 42px circular [BackButton](../components/navigation.md#backbutton) +
"Notifications" title. List of rows: 44px tinted icon circle (per type), title (label/800) + subtitle
(`sub`), right-aligned relative time + optional unread dot.

**React Native notes.** `FlatList`. Icon/tint per notification type (flame=gold streak, heart=crimson
like, bolt=blue-slate friend beat, location=green nearby place, flame=badge). Tapping a row deep-links
to its target (place, province, beat, profile). Mark-read is a mutation that clears the bell dot
(`['engagement','notifications','unread']`). Pull-to-refresh.

**States.** Loading skeleton rows; empty ("Chưa có thông báo — nothing yet"); unread vs. read (dot +
subtle bg tint on unread).

**Tokens.** Row divider `line`; unread dot `palette.primary`; type tints use translucent
brand/utility colors.

**i18n & a11y.** Keys `engagement.notifications.title`, `.empty`, plus server-localized content via
[`LocalizedText`](../localization.md). Rows `accessibilityRole="button"`; unread conveyed by label
("unread"), not color alone.

---

## Streak surfaces (shared)

Not a screen — the streak appears across the app and must stay consistent:

- **[StreakBadge](../components/core.md#streakbadge)** — Map header, Snap home, Feed header, Profile
  stat. Active = gold-tint + `goldDeep` flame + count; broken = `surface` + muted + 0.
- **Broken banner** — Map + Feed; crimson-tint prompt → relight via [Camera](content.md#camera-capture).
- **Snap home streak line** — "Day N — chụp một tấm để giữ lửa".
- **Week strip** — Profile "This week"; 7 day-dots gold when that day had a capture.
- **Sent streak card** + **Milestone** — the reward arc after a capture.

All streak data flows from `['engagement','streak']`; a successful capture invalidates it so every
surface updates together. Day/timezone rules follow the
[engagement design](../../software-architecture-document/design/engagement.md) (the "day" boundary +
break evaluation is an [open product decision](../../../../02-process-documentation/plans-estimates-schedules.md#open-product-decisions-resolve-before-the-phase-that-needs-them)).
