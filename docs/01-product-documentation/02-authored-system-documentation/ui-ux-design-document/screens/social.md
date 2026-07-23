---
title: "Screens — Social"
description: "The friend feed (Beats), Discover, add-friends, and the share-link modal — the Social module screens."
---

# Screens — Social

The [Social module](../../software-architecture-document/design/social.md) screens: the friends-first
layer — the friend feed of beats, the public Discover feed, adding friends via invite link/QR, and
reactions. Built in `features/social/screens`. Delivered in
[Phase 5](../../../../02-process-documentation/plans-estimates-schedules.md).

---

## Friend Feed

**Purpose & entry.** The **Beats** tab — a live feed of friends' captures (Beats whose audience
includes you). Reached from the tab bar and after the capture flow. A streak-broken banner offers a
relight.

**Anatomy.** Title "Beats" + [StreakBadge](../components/core.md#streakbadge); subtitle "Fresh from
your bạn bè, as it happens"; a streak-broken banner (conditional, "Relight" →
[Camera](content.md#camera-capture)); a **hero moment** card (large, author + place + time overlays,
bolt/heart quick actions) followed by a 2-column grid of smaller moment cards. Tapping a card opens
the [Beat Detail Modal](content.md#beat-detail-modal).

**React Native notes.** `FlatList` (or masonry) — hero as `ListHeaderComponent`, grid as the data,
built from the `feed/me` projection fed by `BeatCaptured`. Media via `expo-image`. Quick actions (bolt
= hype, heart = like) are optimistic `BeatReacted` mutations. Pull-to-refresh; new-beats-since
indicator optional. Bottom padding clears the tab bar (~120px).

**States.** Loading skeletons; empty ("Chưa có beat nào — add friends to see their beats" → Add
Friends); streak active vs. broken banner.

**Tokens.** Cards `radius.lg`/`radius.md`; overlays `rgba(13,9,9,0.72)`; fresh author ring
`palette.gold`.

**i18n & a11y.** Keys `social.feed.title`, `.subtitle`, `.streakLost`, `.relight`, `.empty`. Time-ago
localized via the i18n lib. Cards summarize author + place + time for screen readers; quick-action
buttons labeled.

---

## Discover

**Purpose & entry.** The **Explore/Discover** tab — a feed of real, public traveller beats
(location-verified notes + captures), not a travel blog. Reached from the tab bar; cards open the
[Beat Detail Modal](content.md#beat-detail-modal) or the tagged [Place Detail](exploration.md#place-detail).

**Anatomy.** Title "Explore" + subtitle "Real beats from real travellers — not a travel blog"; a
tappable search bar → [Search](exploration.md#search); a horizontal filter chip row (Near {place} /
Trending / Local guides / This week); a vertical list of discovery [cards](../components/core.md#card):
150px media header with a place tag overlay, then author row (avatar, name, verified check, time), the
note, and a star rating + "was here, verified by location".

**React Native notes.** `FlatList` of cards from the `discover` projection (public Beats only —
friends-only beats never appear here, [NFR-SEC-09](../../../01-core-specifications/requirements/non-functional-requirements.md#nfr-sec--security--privacy)).
Media is remote `expo-image`; the location-verified badge is a gold check. Filters are UI state →
query params. Infinite scroll / pull-to-refresh at scale.

**States.** Loading skeleton cards; empty (no public beats for the active filter); verified vs.
unverified author.

**Tokens.** Cards `radius.lg`+ `card` + `shadow.card`; verified check `palette.gold`; active filter
chip = `pill`/`pillText`.

**i18n & a11y.** Keys `social.discover.title`, `.subtitle`, `.searchPlaceholder`, `.filter.*`,
`.verifiedByLocation`. Note text is user content (not translated); UI chrome is. Cards
`accessibilityRole="button"` summarizing author + place.

---

## Add Friends

**Purpose & entry.** Post-signup step (before onboarding) and re-openable from
[Profile](identity.md#profile--preferences). Surfaces the Explorer's own **invite link** so friends
can add them. Continue → [Onboarding](identity.md#onboarding).

**Anatomy.** Brand lockup; title "Add friends to start sharing beats" + helper; an **invite card** —
avatar, name, `@handle`, an invite-link box (`viego.app/add/@handle` + "YOUR LINK" tag), a **Copy
Link** button (turns to "Link Copied!"), and a 3-up share row (Zalo / Facebook / QR Code); a
**Continue to VieGo** primary pill.

**React Native notes.** Copy uses `Clipboard.setStringAsync` with a 2.2s "copied" state. Zalo/Facebook
open the platform share intents; QR opens the [Share Link Modal](#share-link-modal). The link resolves
via `POST /friends/add/{handle}` on the recipient's side (emits `FriendAdded`).

**States.** Copy idle vs. copied; share-intent unavailable → fall back to system share sheet.

**Tokens.** Invite card `surface` + `shadow.card`; copied state `#4E6E58`/white; primary CTA
`shadow.glow`.

**i18n & a11y.** Keys `social.addFriends.title`, `.subtitle`, `.yourLink`, `.copy`, `.copied`,
`.continue`. Link box labeled; copy button announces "copied" via live region.

---

## Share Link Modal

**Purpose & entry.** A bottom-sheet for sharing the invite link / QR, opened from Add Friends "QR
Code" or the Profile "Share" action.

**Anatomy.** Slide-up sheet (`vbSlideUp`) over a blurred backdrop: header (avatar + "Add {name} as
friend" + `@handle`); a QR card ("SCAN QR") with the link and "Anyone with this link can add you on
VieGo"; a **Copy Link** button; a 3-up share row (Zalo / Facebook / System).

**React Native notes.** QR rendered with a QR component from the invite URL. Copy + share behave as in
Add Friends. Backdrop tap / close button dismiss.

**States.** Copy idle vs. copied.

**Tokens.** Sheet `card` + top radius `28`; QR card `surface`; share chips brand-tinted.

**i18n & a11y.** Keys `social.share.title`, `.scanQr`, `.linkHint`, `.copy`, `.copied`. Sheet is a
modal (`accessibilityViewIsModal`); QR has a text alternative (the link).
