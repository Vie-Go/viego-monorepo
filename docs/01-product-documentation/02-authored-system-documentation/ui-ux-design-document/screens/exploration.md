---
title: "Screens — Exploration"
description: "Map home, province sheet, search, discover/explore, and the collection map — the Exploration module screens."
---

# Screens — Exploration

The [Exploration module](../../software-architecture-document/design/exploration.md) screens —
the heart of the product: the interactive Vietnam map, province **unlocking**, discovery, and
the Explorer's collection. Built in `features/exploration/screens`. Delivered in
[Phase 2](../../../../02-process-documentation/plans-estimates-schedules.md#phase-2--core-loop-exploration-weeks-69).

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
   [IconButton](../components/core.md#iconbutton) with unread dot → [Notifications](identity.md#notifications).
2. **Search bar** (tappable, not a live input) → [Search](#search).
3. **Streak-broken banner** (conditional) — crimson-tint prompt "Your streak ended at N days.
   Snap today to relight it." → opens [Camera](engagement.md#camera-capture).
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
   (40px tint thumb, name, category · rating, chevron) → [POI Detail](content.md#poi--heritage-detail).
4. **Public beats** — up to 3 avatar + name + note items, or "No public beats yet — be the
   first."
5. **Check in here** — crimson pill with camera icon → [Camera](engagement.md#camera-capture).

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
[Explore](#discover--explore) search bars. Selecting a result opens the
[Province Sheet](#province-sheet) or [POI Detail](content.md#poi--heritage-detail).

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

## Discover / Explore

**Purpose & entry.** The **Explore** tab — a feed of real traveller "beats" (location-verified
notes + captures), not a travel blog. Reached from the tab bar; cards open
[POI Detail](content.md#poi--heritage-detail).

**Anatomy.** Title "Explore" + subtitle; tappable search bar → [Search](#search); a horizontal
filter chip row (Near {place} / Trending / Local guides / This week); a vertical list of
discovery [cards](../components/core.md#card): 150px media header with a place tag overlay, then
author row (avatar, name, verified check, time), the note, and a star rating + "was here,
verified by location".

**React Native notes.** `FlatList` of cards, `ListHeaderComponent` for title/search/chips.
Media is remote `expo-image` (prototype uses striped placeholders); location-verified badge is
a gold check. Filters are UI state → query params. Infinite scroll / pull-to-refresh at scale.

**States.** Loading skeleton cards; empty (no beats for the active filter); verified vs.
unverified author.

**Tokens.** Cards `radius.lg`+ `card` + `shadow.card`; verified check `palette.gold`; active
filter chip = `pill`/`pillText`.

**i18n & a11y.** Keys `exploration.discover.title`, `.subtitle`, `.searchPlaceholder`,
`.filter.*`, `.verifiedByLocation`. Note text is user content (not translated); UI chrome is.
Cards `accessibilityRole="button"` summarizing author + place.

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
