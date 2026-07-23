---
title: "Screens — Identity"
description: "Language select, onboarding, log in, register, profile & preferences, and notifications — the Identity module screens."
---

# Screens — Identity

The [Identity module](../../software-architecture-document/design/identity.md) screens: first
launch, authentication, the Explorer's profile, preferences (language/theme), and
notifications. Built in `features/identity/screens`. Delivered in
[Phase 1](../../../../02-process-documentation/plans-estimates-schedules.md#phase-1--identity--foundations-weeks-35).

Shared design language: `bg` canvas, 88px top inset (safe-area), 24–26px horizontal padding,
the **vibeat** wordmark + pulsing gold dot lockup, primary crimson pill CTA.

---

## Language Select

**Purpose & entry.** First screen on a fresh install (no stored locale). Lets the Explorer
choose UI language before anything else; re-openable later from
[Profile → Language](#profile--preferences). Continue → [Log in](#log-in).

**Anatomy** (top → bottom):
1. Brand lockup — `vibeat` wordmark (display 30/800) + 11px gold dot with the beat-pulse.
2. Bilingual headline — "Xin chào! / Pick your language" (headline 26/800).
3. Helper — "You can change this any time in your profile." (`sub`).
4. Language list — 5 selectable rows (`vi`, `en`, `ko`, `ja`, `fr`), each a
   [SelectRow](../components/core.md#selectrow): 38px code chip, label + native subtitle,
   right radio dot. Selected row: `primary` border, 6%-crimson fill, filled crimson dot.
5. Spacer, then a full-width **Continue** primary pill.

**React Native notes.** `ScrollView` (list may exceed viewport with 5+ locales). Selection is
local UI state until Continue. On Continue: persist to `i18n` + Identity **Preferences**
(optimistically) and navigate to Log in. Rows are `Pressable`; radio state animates fill only
(no layout shift).

**States.** One row always selected (defaults from device locale, fallback `en`). Continue is
always enabled.

**Tokens.** `radius.md` rows; `space.sm` gaps; selected border `palette.primary`; CTA uses
`shadow.glow`.

**i18n & a11y.** Keys `identity.language.title`, `.subtitle`, `.continue`. Native names stay
untranslated. Each row `accessibilityRole="radio"` with `accessibilityState={{selected}}`;
group labeled by the headline.

---

## Onboarding

**Purpose & entry.** 3 full-bleed photo slides shown after first successful auth, selling the
core loop (living map → snap → streak). Reached from [Log in](#log-in)/[Register](#register);
Next×3 → [Map Home](exploration.md#map-home). Not shown again after completion.

**Anatomy.** Full-screen scenery image + dark bottom-up gradient scrim; brand lockup top-left
(white); bottom block: large title (38/800, `\n` line breaks preserved), subtitle
(`rgba(255,255,255,0.85)`), a 3-segment progress bar, and a **gold** pill CTA ("Next" ×2 then
"Bắt đầu — Get started").

**React Native notes.** Prefer a horizontally paged `FlatList`/`PagerView` (swipe) with the
CTA advancing pages; the prototype advances only via button — support both swipe and tap.
Background image via `Image`/`expo-image` with a `LinearGradient` overlay. Title/subtitle use
the `vbUp` rise-in on each page change. Progress segments fill gold as `i <= page`.

**States.** Page 0–2; final page CTA label + navigates to Map. Skippable? (product decision —
default: no skip, three quick pages). Reduced motion → cross-fade instead of slide.

**Tokens.** Gold CTA `palette.gold` / text `palette.onGold`; scrim is a fixed gradient
(theme-independent — always dark photo overlay).

**i18n & a11y.** Keys `identity.onboarding.slide1.title` … `.slide3.cta`. Progress bar
`accessibilityValue={{min:0,max:3,now:page+1}}`. Images need decorative-or-described alt per
slide.

---

## Log in

**Purpose & entry.** Returning Explorer sign-in. Reached from Language/Onboarding or app
launch with an expired session. Success → Onboarding (first time) or Map. Links to
[Register](#register).

**Anatomy.** Brand lockup; "Welcome back" headline; helper; Email + Password
[Inputs](../components/core.md#input); right-aligned "Quên mật khẩu?" link; **Log in** primary
pill; "or continue with" divider; a row of 3 circular
[SocialAuthButton](../components/core.md#socialauthbutton)s (Google / Facebook / Zalo); footer
"New to VieGo? Create account".

**React Native notes.** `KeyboardAvoidingView` + `ScrollView`. Email field
`keyboardType="email-address"`, `autoCapitalize="none"`, `textContentType="username"`; password
`secureTextEntry` with a show/hide toggle (add vs. prototype). OAuth buttons launch the OIDC
flow (`expo-auth-session`) per [ADR-0003](../../software-architecture-document/decisions/0003-react-native-for-mobile.md);
Email + Google are P1, Facebook + Zalo are fast-follow (render but may be disabled until
wired). Submit disabled until both fields non-empty; show inline validation + a Problem-Details
error banner on failure.

**States.** Idle / validating / submitting (spinner in CTA) / auth-error (banner) /
provider-unavailable (dim the disabled social button).

**Tokens.** Inputs per [Input](../components/core.md#input); CTA `shadow.glow`; social buttons
56px circles, `surface` fill, brand-tinted glyphs.

**i18n & a11y.** Keys `identity.login.*` (`title`, `email`, `password`, `forgot`, `submit`,
`orContinue`, `noAccount`, `createAccount`). Password toggle labeled; error banner uses
`accessibilityLiveRegion="polite"`.

---

## Register

**Purpose & entry.** New-account creation. Reached from Log in ("Create account"). Success →
Onboarding. Links back to Log in.

**Anatomy.** Brand lockup; "Tạo tài khoản" headline; helper "Join VieGo and start unlocking
provinces."; Full name + Email + Password inputs; **Create account** primary pill; "or sign up
with" divider; the same 3 social buttons; footer "Already have an account? Log in".

**React Native notes.** Same form scaffolding as Log in. Add password-strength affordance +
(product) terms/consent line before the CTA if required by store policy. Registration triggers
`ExplorerRegistered` on the backend — the app then routes to Onboarding.

**States.** Mirror Log in, plus field-level validation (name required, email format, password
min length).

**Tokens.** As Log in.

**i18n & a11y.** Keys `identity.register.*` (`title`, `subtitle`, `name`, `email`, `password`,
`submit`, `orSignUp`, `haveAccount`, `login`).

---

## Profile & Preferences

**Purpose & entry.** The **Me** tab. The Explorer's identity, streak stats, unlocked-province
[Collection](exploration.md#collection-your-vietnam), weekly activity, and preference
controls (saved places, language, theme). Persistent bottom tab.

**Anatomy** (scroll):
1. **Avatar block** — 92px [Avatar](../components/core.md#avatar) ringed gold, display name,
   `@handle · city`.
2. **Stat row** — 3 [StatTile](../components/core.md#stattile)s: day streak (flame,
   `goldDeep`), best streak, beats sent.
3. **"Your Vietnam" card** — unlocked-province count + the
   [Collection map](exploration.md#collection-your-vietnam) (`<VnMap unlocked>`).
4. **"This week" card** — 7 day-dots (T2–CN), gold when that day's ritual is done.
5. **Settings list** — [ListRow](../components/core.md#listrow)s: Saved places (count →),
   Language (current → opens [Language Select](#language-select)), **Dark mode**
   [Toggle](../components/core.md#toggle).

**React Native notes.** `ScrollView` with bottom padding clearing the tab bar (~120px). Streak,
collection, and week data come from React Query (`['engagement','streak']`,
`['exploration','collection']`). The dark-mode toggle flips theme immediately and writes to
Preferences (persisted, sent as future `Accept-Language`/theme pref). Language row pushes the
Language Select screen in "settings" mode (no Continue → applies on pick).

**States.** Loading skeletons for stats/collection; empty collection (0 provinces → prompt to
unlock the first); streak-broken (streak shows 0, muted flame).

**Tokens.** Cards `radius.lg`+ `surface`; toggle track `primary` when on; stat flame
`palette.goldDeep`.

**i18n & a11y.** Keys `identity.profile.*` (`streak`, `bestStreak`, `beatsSent`, `yourVietnam`,
`provincesUnlocked`, `thisWeek`, `savedPlaces`, `language`, `darkMode`). Toggle
`accessibilityRole="switch"`; day-dots labeled with weekday + done/not-done.

---

## Notifications

**Purpose & entry.** Chronological activity list (streak reminders, social likes/beats, nearby
spots, badges). Reached from the [Map Home](exploration.md#map-home) bell; the bell shows a
crimson unread dot. Opening marks all read.

**Anatomy.** Header — 42px circular [BackButton](../components/navigation.md#backbutton) +
"Notifications" title. List of rows: 44px tinted icon circle (per type), title (label/800) +
subtitle (`sub`), right-aligned relative time + optional unread dot.

**React Native notes.** `FlatList`. Icon/tint per notification type (flame=gold, heart=crimson,
bolt=blue-slate, location=green). Tapping a row deep-links to its target (POI, province,
profile). Mark-read is a mutation that clears the Map bell dot
(`['identity','notifications','unread']`). Pull-to-refresh.

**States.** Loading skeleton rows; empty ("Chưa có thông báo — nothing yet"); unread vs. read
(dot + subtle bg tint on unread).

**Tokens.** Row divider `line`; unread dot `palette.primary`; type tints use translucent
brand/utility colors.

**i18n & a11y.** Keys `identity.notifications.title`, `.empty`, plus server-localized content
via [`LocalizedText`](../localization.md). Rows `accessibilityRole="button"`; unread conveyed
by label ("unread"), not color alone.
