---
title: "Localization (i18n)"
description: "Vietnamese + English parity across UI and backend-served content."
---

# Localization (i18n)

Vietnamese + English parity is an [architecture principle](../software-architecture-document/architecture-principles.md).

## Approach
- `i18next` (or equivalent) in `shared/i18n`; translation files per language.
- **Priority locales: Vietnamese + English** (parity is launch-blocking). The prototype's language
  picker also offers **Korean (`ko`), Japanese (`ja`), French (`fr`)** as additional selectable
  locales — ship them as UI translations grow; VI/EN stay the parity gate.
- Default locale from device; user override stored in Identity **Preferences** and sent as
  `Accept-Language` to the backend.
- **No hard-coded user-facing strings** — all UI text via translation keys.
- Backend content uses **`LocalizedText`** (`{ vi, en, … }`); the app requests the active language
  and falls back gracefully (→ EN → VI). User-authored content (captions, reviews) is never
  machine-translated.

## Conventions
- Keys namespaced by feature: `content.send.title`, `engagement.streak.title`, `social.feed.title`.
- Numbers/dates/plurals via the i18n library, not manual concatenation.
- VI and EN files stay in lockstep — a missing key fails CI lint.
