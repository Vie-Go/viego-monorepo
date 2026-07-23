---
title: "Frontend Architecture (React Native)"
description: "The React Native app structure, data/state, and navigation — feature folders mirroring the bounded contexts."
---

# Frontend Architecture (React Native)

The mobile app is **React Native + TypeScript** (iOS + Android,
[ADR-0003](decisions/0003-react-native-for-mobile.md)), built with **Expo + EAS**
([ADR-0008](decisions/0008-expo-and-eas-toolchain.md)), routed with **Expo Router**, and using
**Zustand** for client state ([ADR-0011](decisions/0011-expo-router-zustand-maestro-for-mobile.md)).
It consumes the versioned
[REST API](../../../01-core-specifications/api-system-specifications/rest-api.openapi.yaml) and
renders per the Explorer's language and theme.

## Project structure (feature-first, mirrors bounded contexts)

```
src/
├── app/                 ← entry, providers (query client, theme, i18n), root navigator
├── features/
│   ├── identity/        ← auth screens, handle, session, preferences
│   ├── exploration/     ← map, province sheet, place detail, search, collection
│   ├── content/         ← camera, capture/send flow, beat detail, memories
│   ├── engagement/      ← streak UI, milestones/celebration, notifications
│   └── social/          ← friend feed, discover, add-friends, reactions
│       ├── api/         ← endpoints + React Query hooks
│       ├── components/  ← feature-scoped UI
│       ├── screens/     ← navigable screens
│       └── model/       ← TS types mirroring API DTOs
├── shared/              ← design system, primitives, i18n, api client, hooks
│   ├── ui/              ← Button, Card, Input (design tokens)
│   ├── theme/           ← tokens, light/dark
│   ├── i18n/            ← translations, hook
│   └── api/             ← http client, auth interceptor, error mapping
└── assets/              ← Urbanist fonts, map svg, images
```

Feature modules line up with the [bounded contexts](ddd-and-domain-model.md) so FE and BE share
a mental model and vocabulary. The map is a React Native SVG component ported from the
prototype's `<vn-map>`.

## Data & state
- **API client** (`shared/api`): base URL per [environment](infrastructure.md), Bearer-JWT auth
  interceptor with refresh, `Accept-Language` from the active locale, Problem-Details → typed
  errors. Types mirror the OpenAPI contract.
- **Server state:** React Query hooks per feature; keys namespaced (`['exploration','collection']`).
  The **capture** mutation invalidates collection + map + streak + friend feed so an unlock, a streak
  advance, and a friend's Beat all refresh together.
- **UI state:** component state, or **Zustand** ([ADR-0011](decisions/0011-expo-router-zustand-maestro-for-mobile.md))
  once it needs to be shared, for UI-only concerns; never mirror server data.
- **Offline (proposed):** queue a capture (photo + audience) and reconcile on reconnect; the
  optimistic "Beat sent!" state aligns with backend idempotency.

## Navigation — Expo Router (file-based)

Routes are files under `mobile/app/`, not a hand-assembled navigator tree
([ADR-0011](decisions/0011-expo-router-zustand-maestro-for-mobile.md)):

```
app/
├── (auth)/           language, sign-in, register, add-friends   [identity + social]
└── (tabs)/           center camera button
    ├── map/            interactive map, province sheet, place    [exploration]
    ├── feed/           friend feed (Beats)                       [social]
    ├── camera/         capture → send → beat sent (center)       [content]
    ├── discover/       public discover + search                  [social + exploration]
    └── profile/        handle, invite link, streak, preferences  [identity]
```
The **camera** is the centre of the bottom nav; capture opens the send/audience sheet, then the
"Beat sent!" confirmation. **Memories** opens from the camera home. Deep links:
`viego://province/{id}`, `viego://place/{id}`, and the invite link `viego.app/add/@handle` map to
Expo Router's built-in deep-linking (file path ↔ URL).

## Cross-cutting rules
- No hard-coded colors/spacing/type — use [design tokens](../ui-ux-design-document/design-system.md).
- No hard-coded user-facing strings — use [localization](../ui-ux-design-document/localization.md).
- Test both themes and both locales for key screens.
