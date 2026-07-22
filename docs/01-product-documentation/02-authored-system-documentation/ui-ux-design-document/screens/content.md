---
title: "Screens — Content"
description: "POI / heritage detail, Cultural Beats playback, and trivia — the Content module screens."
---

# Screens — Content

The [Content module](../../software-architecture-document/design/content.md) screens: the
cultural payoff behind an unlocked province — heritage stories, **Cultural Beats** (audio), and
trivia. Built in `features/content/screens`. Delivered in
[Phase 4](../../../../02-process-documentation/plans-estimates-schedules.md#phase-4--content-heritage--beats-weeks-1214).

The [POI / Heritage Detail](#poi--heritage-detail) screen exists in the prototype as the
`POI detail` surface. **Cultural Beats** and **Trivia** are product features the prototype does
not yet render as standalone screens; their specs below are **prototype-consistent** (same
visual language) and forward-looking — flagged accordingly.

---

## POI / Heritage Detail

**Purpose & entry.** Deep detail for a spot / heritage place: hero image, "why it matters"
story, practical info, community captures, reviews, and a **Capture here** CTA. Reached from the
[Province Sheet](exploration.md#province-sheet), [Discover](exploration.md#discover--explore),
or [Search](exploration.md#search). Capture → [Camera](engagement.md#camera-capture).

**Anatomy** (scroll):
1. **Hero** — 300px image; back + like [IconButton](../components/core.md#iconbutton)s float
   over a top gradient; content sheet overlaps the hero by ~26px (rounded top).
2. **Title block** — name (headline 24/800); rating pill (gold-tint star); "Locals say: '{vi}'"
   italic; a category tag + "{checkins} check-ins · {friends} friends were here".
3. **Why it matters** — heritage narrative paragraph (`sub`).
4. **Info card** — [ListRow](../components/core.md#listrow)s: Hours, Cost, and a gold **Local
   tip**.
5. **Community beats** — "N captures" + a 3-up grid (2 captures + a "+N" more tile).
6. **Recent from travellers** — review items (avatar, name, time, note).
7. **Action row** — crimson **Capture here** pill (glow) + a `surface` bookmark
   [IconButton](../components/core.md#iconbutton).

**React Native notes.** `ScrollView` with a parallax/collapsing hero (Reanimated
`useAnimatedScrollHandler`) — optional; static hero acceptable. Hero + gallery images via
`expo-image`. Like/bookmark are optimistic mutations. Content (`whyItMatters`, `tip`, hours,
cost) is server [`LocalizedText`](../localization.md) gated by province unlock — a **locked**
province returns 403 and the screen shows a locked state (see below). "Friends were here" and
reviews come from social/exploration queries.

**States.** Unlocked (full content) vs. **locked** (blurred/omitted heritage body + "Unlock
{province} to read its story" prompt → Province Sheet). Liked/bookmarked toggles. Loading
skeleton (hero + text lines). Image-less spot → striped placeholder.

**Tokens.** Hero overlay gradient; rating pill `rgba(242,183,47,0.16)`; info card `surface`
`radius.lg`; Capture CTA `shadow.glow`.

**i18n & a11y.** Keys `content.poi.whyItMatters`, `.hours`, `.cost`, `.localTip`,
`.communityBeats`, `.captures`, `.recentTravellers`, `.captureHere`, `.locked`. Body content
localized server-side. Hero image described; like/bookmark buttons expose pressed state; gallery
tiles labeled "user capture".

---

## Cultural Beats

> **Product feature — prototype-consistent, forward-looking.** The prototype models "beats" as
> photo captures; the VieGo product's **Cultural Beats** are curated **audio** pieces
> (music/soundscapes/narration) tied to a heritage place. This spec applies the prototype's
> visual language to that feature; validate against the
> [Content design](../../software-architecture-document/design/content.md) when built.

**Purpose & entry.** Play a province's Cultural Beats. Opened from a
[POI / Heritage Detail](#poi--heritage-detail) "play" affordance (or a heritage list within the
province). Gated by unlock (403 when locked).

**Anatomy.** Artwork header (heritage image); track title + place; a waveform/progress bar;
transport controls (play/pause primary crimson, skip); a beat-pulse indicator echoing the brand
gold dot; a playlist of the province's beats (title, duration, playing state); a "Why this
beat" note (localized).

**React Native notes.** Audio via `expo-av` (or `react-native-track-player` for background +
lock-screen controls). Signed/CDN media URLs from the backend (object storage). Playback state
in a light store so mini-player can persist across screens (optional). Waveform can be a
simplified animated bar set; the gold pulse reuses the `vbBeat` animation, reduced-motion aware.
Respect the device silent switch and audio-focus/interruptions.

**States.** Loading media; playing / paused / buffering; locked (403 → unlock prompt); no beats
yet for the province.

**Tokens.** Play button `palette.primary` (glow); pulse `palette.gold`; playlist rows `surface`.

**i18n & a11y.** Keys `content.beats.nowPlaying`, `.whyThisBeat`, `.duration`, `.locked`,
`.empty`. Transport controls labeled + `accessibilityRole="button"`; expose playback state and
elapsed/total time to screen readers; captions/transcript for narrated beats where available.

---

## Trivia

> **Product feature — prototype-consistent, forward-looking.** Not present as a screen in the
> prototype; specified here in the prototype's visual language per the product scope. Validate
> against the [Content design](../../software-architecture-document/design/content.md).

**Purpose & entry.** A short cultural quiz for an unlocked province — reinforces heritage
learning and can feed engagement. Opened from
[POI / Heritage Detail](#poi--heritage-detail) or a province's content section. Gated by unlock.

**Anatomy.** Progress indicator (question i of N, gold segments like onboarding); question card
(title 18/800 + optional image); 2–4 answer options as full-width
[SelectRow](../components/core.md#selectrow)s; on answer — correct (gold/`goldDeep`) vs.
incorrect (crimson) feedback + a localized explanation; a **Next** primary pill; a results
screen (score, a small reward/`Bolt` badge, "Tiếp tục").

**React Native notes.** Questions from the content API (localized). Answer selection locks the
row set, reveals feedback, enables Next. Results may award a badge (engagement crossover). Keep
feedback motion subtle (pop on the chosen row), reduced-motion aware. No timers by default
(accessibility) unless product requires.

**States.** Question (unanswered → answered/feedback); last question → results; locked province
→ unlock prompt; empty (no trivia for the province).

**Tokens.** Correct `palette.gold`/`goldDeep`; incorrect `palette.primary`; progress segments
gold; Next CTA `shadow.glow`.

**i18n & a11y.** Keys `content.trivia.progress`, `.correct`, `.incorrect`, `.explanation`,
`.next`, `.results.score`, `.results.continue`. Questions/answers/explanations server-localized.
Options `accessibilityRole="radio"`; correctness announced as text, never color alone;
feedback via live region.
