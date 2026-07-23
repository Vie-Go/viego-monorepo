---
title: "Screens — Exploration"
description: "Map home, province sheet, search, place (POI) detail, and the collection map — the Exploration module screens."
---

# Screens — Exploration

The [Exploration module](../../software-architecture-document/design/exploration.md) screens: the
interactive Vietnam map, province **unlocking** (driven by capturing a Beat), places, and the
Explorer's collection. Built in `features/exploration/screens`. Delivered in
[Phase 2](../../../../02-process-documentation/plans-estimates-schedules.md).

> The public **Discover** feed lives in [Social → Discover](social.md#discover) (it is a feed of
> public beats, not a map surface).

The map itself is the [`<VnMap>` component](../components/map.md) ported from the prototype's
`<vn-map>` to `react-native-svg`.

---

## Map Home

**Purpose & entry.** The **Map** tab and app home. Shows the Explorer greeting, streak,
notifications entry, search, category filters, and the interactive map with a check-in **heat**
overlay. Tapping a province opens the [Province Sheet](#province-sheet).

**Anatomy** (top → bottom):
1. **Header row** — 42px avatar; greeting ("Xin chào, {name}") + prompt ("Where's your next
   beat?"); [StreakBadge](../components/core.md#streakbadge); bell
   [IconButton](../components/core.md#iconbutton) with unread dot → [Notifications](engagement.md#notifications).
2. **Search bar** (tappable, not a live input) → [Search](#search).
3. **Streak-broken banner** (conditional) — crimson-tint prompt "Your streak ended at N days.
   Snap today to relight it." → opens [Camera](content.md#camera-capture).
4. **Category chips** — horizontal scroller of [Chip](../components/core.md#chip)s (All, Cà
   phê, Food, Heritage, Nightlife, Nature, Hidden gems); filters map spots + the sheet.
5. **Map canvas** — rounded `surface` panel with a dotted texture; centered `<VnMap heat
   interactive>`; a **heat legend** ([HeatLegend](../components/map.md#heatlegend)) top-right;
   an empty hint "Chạm vào tỉnh — tap a province" when nothing is selected.
6. Bottom spacer (~104px) clearing the floating [tab bar](../components/navigation.md#bottomtabbar).

**React Native notes.** Screen is a `View` with a flexible map region (`flex:1`). The map is an
SVG whose provinces are `Pressable` paths emitting a `province-pick` equivalent (callback prop)
→ sets selected province → renders the sheet. Heat string is derived from the Explorer's
collection + public check-in counts (React Query). Category filter is UI state affecting the
sheet's spot list. Header greeting/streak from identity + engagement queries.

**States.** No selection (hint visible) / province selected (sheet up). Loading: map skeleton
(province outlines, no heat). Streak active vs. broken (banner + badge variant).

**Tokens.** Map panel `radius.lg`+ `surface`; unlocked provinces `mapUnlocked`; heat ramp
`palette.heat`; legend chip on `navBg`.

**i18n & a11y.** Keys `exploration.map.greeting`, `.prompt`, `.searchPlaceholder`,
`.tapHint`, `.streakBroken`. Provinces expose `accessibilityLabel` = province name + status
(locked/unlocked/N check-ins). Heat conveyed by legend + label, not color alone.

---

## Province Sheet

**Purpose & entry.** Bottom sheet that rises when a province is tapped on the Map. Summarizes
the province, the Explorer's own check-ins, spots within it, public "beats", and the primary
**Check in here** (unlock) action. This is the **unlock** entry point.

**Anatomy.** Draggable sheet (`vbSlideUp`) over the map:
1. **Header** — province name (title 18/800); tier dot + "N public check-ins"; close
   [IconButton](../components/core.md#iconbutton).
2. **Your status** — gold-tint "You checked in here — N beats" **or** dashed "No beats from you
   yet — your first capture unlocks this province."
3. **Spots here** (if any, filtered by category) — [SpotRow](../components/core.md#listrow)s
   (40px tint thumb, name, category · rating, chevron) → [Place Detail](exploration.md#place-detail).
4. **Public beats** — up to 3 avatar + name + note items, or "No public beats yet — be the
   first."
5. **Check in here** — crimson pill with camera icon → [Camera](content.md#camera-capture).

**React Native notes.** Use `@gorhom/bottom-sheet` (or a Reanimated sheet): snap points
~45%/85%, drag-to-dismiss, backdrop tap closes. Content is a scroll inside the sheet. The
province → spots mapping and public-beat list come from queries keyed by province id. "Check in
here" carries the province (and optional spot) context into the capture flow; a successful send
emits `ProvinceUnlocked` and flips the province fill to gold with a celebratory pulse
(reduced-motion aware).

**States.** Unlocked (has your beats) vs. locked (dashed prompt); has spots vs. none; has
public beats vs. none. Archipelagos (Hoàng Sa / Trường Sa) have their own public-beat copy.

**Tokens.** Sheet `card` + `shadow.card`; your-status gold tint `rgba(242,183,47,0.14)`; tier
dot from `palette.heat`; CTA crimson (no glow inside a sheet — flat crimson pill).

**i18n & a11y.** Keys `exploration.province.publicCheckins`, `.yourBeats`, `.noBeatsYet`,
`.spotsHere`, `.publicBeats`, `.noPublicBeats`, `.checkIn`. Sheet is a modal for a11y
(`accessibilityViewIsModal`), focus moves into it on open, close returns focus to the province.

---

## Search

**Purpose & entry.** Full-screen search over provinces and spots. Reached from the Map or
[Discover](social.md#discover) search bars. Selecting a result opens the
[Province Sheet](#province-sheet) or [Place Detail](exploration.md#place-detail).

**Anatomy.** Header — [BackButton](../components/navigation.md#backbutton) + a live search
[Input](../components/core.md#input) (leading search icon, placeholder "Phở, pagodas,
provinces…"). Section label ("Popular right now" when empty, "Results" when querying). Result
[ListRow](../components/core.md#listrow)s: 40px icon tile, title + subtitle, right kind-tag
("Province" / "Spot"). Empty state when no match.

**React Native notes.** `autoFocus` the input on mount. Debounce query (~200ms); filter locally
for the seeded set, swap to a backend search endpoint at scale. `FlatList` results with
`keyboardShouldPersistTaps="handled"`. Empty query shows popular spots + featured provinces.

**States.** Empty query (popular) / results / no-results ("Không tìm thấy — nothing matches
yet. Try a province or a dish.").

**Tokens.** Search field `surface`, `radius.sm`; kind-tag `surface` + `line` border; row
divider `line`.

**i18n & a11y.** Keys `exploration.search.placeholder`, `.popular`, `.results`, `.empty`,
`.kind.province`, `.kind.spot`. Result count announced via live region; input labeled "Search".

---

## Place Detail

**Purpose & entry.** Deep detail for a **Place** (POI): hero image, "why it matters" context,
practical info, community beats, reviews, and a **Capture here** CTA. Reached from the
[Province Sheet](#province-sheet), [Search](#search), or a beat's tagged place. Capture →
[Camera](content.md#camera-capture). Unlike the old heritage model, this screen is **never
unlock-gated** — a place's context is open to everyone; capturing there is what unlocks the province.

**Anatomy** (scroll):
1. **Hero** — 300px image; back + like [IconButton](../components/core.md#iconbutton)s float over a
   top gradient; content sheet overlaps the hero by ~26px (rounded top).
2. **Title block** — name (headline 24/800); rating pill (gold-tint star); "Locals say: '{vi}'"
   italic; a category tag + "{checkins} check-ins · {friends} friends were here".
3. **Why it matters** — the place's context paragraph (`sub`).
4. **Info card** — [ListRow](../components/core.md#listrow)s: Hours, Cost, and a gold **Local tip**.
5. **Community beats** — "N captures" + a 3-up grid (2 captures + a "+N" more tile) → open the
   [Beat Detail Modal](content.md#beat-detail-modal).
6. **Recent from travellers** — [reviews](../../software-architecture-document/design/content.md)
   (avatar, name, time, note; "verified by location").
7. **Action row** — crimson **Capture here** pill (glow) + a `surface` bookmark
   [IconButton](../components/core.md#iconbutton).

**React Native notes.** `ScrollView` with an optional collapsing hero. Hero + gallery images via
`expo-image`. Like/bookmark are optimistic mutations. Place context (`whyItMatters`, `tip`, hours,
cost) is server [`LocalizedText`](../localization.md) from the `exploration` place endpoint; community
beats + reviews come from `content`. "Friends were here" comes from social.

**States.** Full content; liked/bookmarked toggles; loading skeleton (hero + text lines); image-less
place → striped placeholder; no beats/reviews yet → "be the first".

**Tokens.** Hero overlay gradient; rating pill `rgba(242,183,47,0.16)`; info card `surface`
`radius.lg`; Capture CTA `shadow.glow`.

**i18n & a11y.** Keys `exploration.place.whyItMatters`, `.hours`, `.cost`, `.localTip`,
`.communityBeats`, `.captures`, `.recentTravellers`, `.captureHere`. Body context localized
server-side. Hero image described; like/bookmark buttons expose pressed state; gallery tiles labeled
"user capture".

---

## Collection ("Your Vietnam")

**Purpose & entry.** The Explorer's unlocked-province collection, surfaced as a card on
[Profile](identity.md#profile--preferences) ("Your Vietnam — N / M provinces unlocked") and
optionally as its own screen. Realizes the `Collection` aggregate.

**Anatomy.** Card header (count) + a `<VnMap unlocked>` rendering unlocked provinces in gold
against locked neutral fills. (Full-screen variant adds a scrollable province list with
per-province beat counts.)

**React Native notes.** Same [`<VnMap>`](../components/map.md) as Map Home but in
`unlocked` (non-heat) mode and non-interactive inside the profile card; the standalone screen
makes provinces tappable → [Province Sheet](#province-sheet). Data:
`['exploration','collection','me']`; invalidated by unlock mutations so it refreshes alongside
map + streak.

**States.** Empty (0 unlocked → "Unlock your first province" prompt); partial; complete
(all provinces → celebratory treatment).

**Tokens.** Unlocked fill `mapUnlocked`; locked `mapProvince`; card `surface` `radius.lg`.

**i18n & a11y.** Keys `exploration.collection.title`, `.progress`, `.empty`. Map exposes a
textual summary ("9 of 34 provinces unlocked") for screen readers since the SVG is decorative.
