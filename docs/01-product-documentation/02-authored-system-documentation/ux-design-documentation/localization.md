---
title: "Localization (i18n)"
description: "Vietnamese + English parity across UI and backend-served content."
---

# Localization (i18n)

Vietnamese + English parity is an [architecture principle](../software-architecture-document/architecture-principles.md).

## Approach
- `i18next` (or equivalent) in `shared/i18n`; translation files per language (`vi`, `en`).
- Default locale from device; user override stored in Identity **Preferences** and sent as
  `Accept-Language` to the backend.
- **No hard-coded user-facing strings** — all UI text via translation keys.
- Backend content uses **`LocalizedText`** (`{ vi, en }`); the app requests the active language
  and falls back gracefully.

## Conventions
- Keys namespaced by feature: `exploration.unlock.cta`, `engagement.streak.title`.
- Numbers/dates/plurals via the i18n library, not manual concatenation.
- VI and EN files stay in lockstep — a missing key fails CI lint.
