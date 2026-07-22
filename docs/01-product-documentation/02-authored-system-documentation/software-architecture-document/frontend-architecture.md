---
title: "Frontend Architecture (React Native)"
description: "The React Native app structure, data/state, and navigation — feature folders mirroring the bounded contexts."
---

# Frontend Architecture (React Native)

The mobile app is **React Native + TypeScript** (iOS + Android,
[ADR-0003](decisions/0003-react-native-for-mobile.md)). It consumes the versioned
[REST API](../../../01-core-specifications/api-system-specifications/rest-api.openapi.yaml) and
renders per the Explorer's language and theme.

## Project structure (feature-first, mirrors bounded contexts)

```
src/
├── app/                 ← entry, providers (query client, theme, i18n), root navigator
├── features/
│   ├── identity/        ← auth screens, session, preferences
│   ├── exploration/     ← map, province detail, unlock flow, collection
│   ├── engagement/      ← streak UI, daily ritual, rewards
│   └── content/         ← heritage, beat player, trivia
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
  Mutations (unlock) invalidate affected queries so map + collection + streak refresh together.
- **UI state:** component state or a light store (Zustand/Context) for UI-only concerns; never
  mirror server data.
- **Offline (proposed):** cache collection/streak; queue unlock actions and reconcile on
  reconnect (aligns with backend idempotency).

## Navigation (proposed)
```
RootNavigator
├── AuthStack       welcome, sign-in, register            [identity]
└── AppTabs
    ├── MapTab        interactive map, province, unlock    [exploration]
    ├── CollectionTab unlocked provinces                   [exploration]
    ├── StreakTab     streak, ritual, rewards              [engagement]
    └── ProfileTab    preferences, account                 [identity]
```
Content surfaces (heritage, beat player, trivia) open from a province detail. Deep link:
`vibeat://province/{id}`.

## Cross-cutting rules
- No hard-coded colors/spacing/type — use [design tokens](../ux-design-documentation/design-system.md).
- No hard-coded user-facing strings — use [localization](../ux-design-documentation/localization.md).
- Test both themes and both locales for key screens.
