---
title: "Screens — Content (Beats)"
description: "The capture flow (camera → send → sent), the beat detail modal, and memories — the Content module screens."
---

# Screens — Content (Beats)

The [Content module](../../software-architecture-document/design/content.md) screens — the heart
of the product: capturing a **Beat** (a photo check-in) and reliving it. The capture flow (Camera →
Send → Sent) publishes `BeatCaptured`, which unlocks the province, advances the streak, and fans the
Beat out to feeds. Built in `features/content/screens`. Delivered in
[Phase 3](../../../../02-process-documentation/plans-estimates-schedules.md).

The capture surfaces are **full-screen dark** (`#0D0909`) regardless of theme — a deliberate "camera
mode". The bottom tab bar is hidden throughout the flow.

---

## Camera Capture

**Purpose & entry.** Opens the camera to capture today's Beat. Reached from the center **camera FAB**
in the [tab bar](../components/navigation.md#bottomtabbar), the Snap home shutter, the
[Province Sheet](exploration.md#province-sheet) "Check in here", the
[Place Detail](exploration.md#place-detail) "Capture here", or the streak-broken banner. Snap →
[Send Beat](#send-beat).

**Anatomy.** Dark screen: top row — close [IconButton](../components/core.md#iconbutton) + centered
**auto-tag** chip (gold-tint, location pin, "{Place — Province}", "auto-tag"); a large rounded camera
preview with corner framing guides; a "Day N — keep it burning" streak line; bottom controls — gallery
thumbnail, 80px **shutter** (white ring, crimson core, press-scale), and a flip-camera button.

**React Native notes.** Camera via `expo-camera` (`CameraView`); request permission on entry with a
rationale sheet and a denied-state fallback (open Settings). The auto-tag comes from device location +
the carried province/place context (reverse-geocode or nearest known place); **outside Vietnam** the
tag reads "Vị trí ngoài Việt Nam" and no precise province is resolved. Shutter press animates scale
`0.85`, captures a still, then routes to Send with the photo URI. Gallery button opens
`expo-image-picker`. Keep the flow dark; use `StatusBar` light content.

**States.** Permission-pending / granted (live preview) / denied (placeholder + "Enable camera" CTA).
Location on/off / outside-Vietnam (auto-tag suppressed). Streak day N reflects current+1.

**Tokens.** Fixed dark palette (not theme-driven); auto-tag `rgba(242,183,47,0.14)` + gold; shutter
core `palette.primary`.

**i18n & a11y.** Keys `content.camera.autoTag`, `.outsideVN`, `.dayHint`, `.permission.title`,
`.enable`. Shutter `accessibilityLabel="Capture"`, `accessibilityRole="button"`; flip + gallery
labeled.

---

## Send Beat

**Purpose & entry.** Compose + choose **audience** for the captured Beat. Reached from
[Camera](#camera-capture) (back returns to camera). Send → [Beat Sent](#beat-sent).

**Anatomy.** Dark screen: header (back + "Send to…"); a tilted capture **preview card** (`vbPop` in)
with the location tag; an optional caption field ("Thêm caption…"); a **Friends / Public**
[SegmentedControl](../components/navigation.md#segmentedcontrol); audience body — for **Friends**, a
horizontal picker of friend [Avatar](../components/core.md#avatar)s (gold ring + check when selected);
for **Public**, a globe note ("Everyone exploring this spot will see your beat as social proof."); a
gold **Send** pill ("Send to N bạn" / "Post publicly").

**React Native notes.** Caption is a `TextInput` over the dark surface. Segmented control drives which
body renders; **Friends is the default** ([friends-first principle](../../software-architecture-document/architecture-principles.md)).
Friend selection is multi-select local state; send count updates the CTA label. Send is a mutation
that captures the Beat and emits `BeatCaptured` (province unlock + streak advance + feed fan-out
follow asynchronously); route optimistically to Sent. Handle the offline queue per the
[frontend offline strategy](../../software-architecture-document/frontend-architecture.md#data--state).

**States.** Friends vs. Public; caption empty/filled; sending (spinner in CTA).

**Tokens.** Dark surfaces `rgba(255,255,255,0.08)`; selected friend ring `palette.gold`; Send pill
`palette.gold`/`onGold` with gold glow.

**i18n & a11y.** Keys `content.send.title`, `.captionPlaceholder`, `.audience.friends`,
`.audience.public`, `.publicNote`, `.sendToFriends`, `.postPublicly`. Segmented control
`accessibilityRole="tablist"`; friend avatars are toggle buttons with selected state.

---

## Beat Sent

**Purpose & entry.** Success confirmation after sending. Auto-context to
[Milestone](engagement.md#milestone-celebration) when the streak hits a milestone, else back to the
[Feed](social.md#friend-feed). "Keep exploring" dismisses.

**Anatomy.** Centered dark screen: 96px gold **check** badge (`vbPop`); "Beat sent!" (display/800,
white); a summary line ("Landed on N friends' home maps" / "Live on the public map for this spot") +
the location tag; a streak pill card ("Day N", note e.g. "Milestone reached!" / "Personal best: 21");
a ghost "Keep exploring" button.

**React Native notes.** Pure confirmation screen; no data entry. Shown **optimistically** while upload
+ fan-out complete ([NFR-PERF-04](../../../01-core-specifications/requirements/non-functional-requirements.md#nfr-perf--performance)).
The streak note is derived (broken-relit vs. milestone vs. best). "Keep exploring" routes to Milestone
if the streak crossed a threshold, otherwise Feed.

**States.** Friends vs. public summary; milestone-reached vs. normal vs. relit-after-break.

**Tokens.** Fixed dark; check badge `palette.gold`/`onGold`; streak card `rgba(255,255,255,0.07)`.

**i18n & a11y.** Keys `content.sent.title`, `.summaryFriends`, `.summaryPublic`,
`.streakNote.milestone`, `.streakNote.best`, `.streakNote.relit`, `.keepExploring`. Announce "Beat
sent" via live region; success not conveyed by color alone (icon + text).

---

## Beat Detail Modal

**Purpose & entry.** A focused full-screen view of a single Beat, opened by tapping any Beat — from
[Memories](#memories), the [Province Sheet](exploration.md#province-sheet) album, the
[Friend Feed](social.md#friend-feed), or [Discover](social.md#discover).

**Anatomy.** Blurred dark backdrop; top bar — close [IconButton](../components/core.md#iconbutton),
author avatar + name + time, and a **Friend** / **Public** badge; a large rounded photo card (`vbPop`)
with a location tag, the caption, a like control (heart + count), a "Streak beat" gold marker, and a
**Done** pill.

**React Native notes.** Presented as a modal route over any screen. Photo via `expo-image` from a
signed URL; a caller not in the Beat's audience gets a 403 and the modal is not opened. Like is an
optimistic reaction mutation (`BeatReacted`). Honour `useReducedMotion()` for the pop-in.

**States.** Friend vs. public badge; has-caption vs. none; liked vs. not; image vs. striped
placeholder.

**Tokens.** Backdrop `rgba(13,9,9,0.95)` + blur; Friend badge `palette.gold`; like active
`palette.primary`.

**i18n & a11y.** Keys `content.beat.friend`, `.public`, `.streakBeat`, `.done`. Caption is user
content (untranslated); like button labeled with state; focus trapped in the modal.

---

## Memories

**Purpose & entry.** The Explorer's own Beats, time-ordered by month — a personal capture history.
Reached from the Snap home "History / Memories" affordance. Tapping a tile opens the
[Beat Detail Modal](#beat-detail-modal).

**Anatomy.** Header (back + "Memories" + profile avatar); stacked month **cards** connected by dotted
connectors — a faded previous-month card, the current month ("July 2026") as a 7-column grid of 38px
photo tiles (streak days ringed gold with a flame marker; a "+N" count badge on busy days; empty
future days as blank tiles); a bottom stats pill ("N Beats · Nd streak").

**React Native notes.** `ScrollView` (or sectioned `FlatList` by month). Tiles are `Pressable` photo
thumbnails via `expo-image`; the grid mirrors the prototype's calendar layout. Data from
`['content','memories']`. Streak markers come from the engagement streak overlay.

**States.** Loading skeleton grid; empty ("Chưa có beat nào — capture your first"); current month with
gold streak ring on captured days.

**Tokens.** Cards `radius.lg` + `surface`/`card`; streak ring `palette.gold`; stats pill `card` +
`shadow.card`.

**i18n & a11y.** Keys `content.memories.title`, `.beats`, `.streak`, `.empty`. Month headings
localized; tiles labeled with date + "captured/empty".
