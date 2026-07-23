---
title: "Design — Identity module (Authentication)"
description: "Detailed design of the identity module: Explorer accounts, OIDC auth, preferences, and the ExplorerRegistered event."
---

# Design — Identity module (Authentication)

- **Module:** `identity` · **Core feature:** Authentication ·
  **Phase:** [P1 — Identity & foundations](../../../../02-process-documentation/plans-estimates-schedules.md)
- **Spec:** [`authentication.feature`](../../../01-core-specifications/executable-specifications/features/identity/authentication.feature)
- **Requirements:** [FR-ID-01…09](../../../01-core-specifications/requirements/functional-requirements.md#fr-id--identity-authentication) · constrained by [NFR-SEC-*](../../../01-core-specifications/requirements/non-functional-requirements.md#nfr-sec--security--privacy)
- **Upstream supplier** to every other context — nothing works without an authenticated Explorer,
  which is why this is the first phase and the gate for the whole [critical path](../../../../02-process-documentation/plans-estimates-schedules.md).

## Purpose & scope

Let a visitor sign in with a supported [Auth Provider](../ddd-and-domain-model.md)
and become an **Explorer** with a unique **handle** (`@name`) whose **Preferences** (language +
theme) persist across sessions and devices. On first sign-in, publish **`ExplorerRegistered`** so
Exploration, Content, Engagement, and Social can provision their per-Explorer state.

In scope: Email + Google now; JWT issue/refresh; preferences. Deferred: Facebook + Zalo
(fast-follow, may slip to P5) and cross-provider **account linking** (open decision).

## Domain model

- **Explorer** *(aggregate root)* — `id: ExplorerId`, `handle`, `authProviders: AuthProvider[]`,
  `profile`, `preferences: Preferences`.
  - *Invariant:* `handle` is unique; at least one `AuthProvider`; an Explorer is created exactly once
    per identity (first sign-in) — repeat sign-ins authenticate, they do not re-register.
- **Preferences** *(value object)* — `{ language: vi|en|…, theme: light|dark }`. Replaced wholesale
  on update (VOs are immutable).
- **AuthProvider** *(value object)* — `{ kind: email|google|facebook|zalo, ref }` where `ref` is
  the provider's subject id (never a password — VieGo is an OIDC relying party, it stores no
  credentials).

## Commands & events

| Direction | Name | Trigger / effect |
|-----------|------|------------------|
| Command | `RegisterOrSignIn(provider, token)` | Validate the OIDC token; create the Explorer on first sight, else authenticate. |
| Command | `UpdatePreferences(explorerId, prefs)` | Replace preferences; emit `PreferencesUpdated`. |
| **Publishes** | **`ExplorerRegistered`** *(first sign-in only)* | `{ explorerId, handle, at }` — fans out to all contexts. |
| **Publishes** | `PreferencesUpdated` | `{ explorerId, language, theme, at }`. |

Events are immutable past-tense records in `identity/api/events`, carrying **ids/primitives only**.

## REST API

Contract: [OpenAPI](../../../01-core-specifications/api-system-specifications/rest-api.openapi.yaml).

| Method & path | Purpose | Notes |
|---------------|---------|-------|
| `POST /api/v1/auth/{provider}` | Exchange a provider token for a VieGo session | Returns access + refresh JWT; provider ∈ `email\|google` at P1 |
| `POST /api/v1/auth/refresh` | Rotate the access token | Refresh-token rotation with **reuse detection** (rotation family in [Redis](../decisions/0007-redis-cache-and-token-rotation.md)); a replayed token revokes the family |
| `GET /api/v1/me` | Current Explorer + preferences | Bearer JWT |
| `PUT /api/v1/me/preferences` | Update language/theme | Emits `PreferencesUpdated` |

Auth is **Bearer JWT**; errors are RFC-7807 Problem Details, mapped to typed errors on the client.

## Persistence

- Schema **`identity`** (owned; no cross-module FKs).
- Tables: `explorer`, `explorer_auth_provider` (1-N), preferences embedded on `explorer`.
- Flyway: `db/migration/identity/V1__init.sql`.
- Secrets: no passwords stored; only OIDC provider subject refs + rotating refresh-token handles.
- **Redis** (namespace `identity:*`, [ADR 0007](../decisions/0007-redis-cache-and-token-rotation.md))
  holds the auth hot-path state — the **refresh-token rotation family** (with reuse detection), a
  short-lived **revoked-`jti` denylist**, and auth **rate-limit** counters. Access JWTs stay
  self-validating (signature + `exp`), so Redis is only consulted for *rotation* and *revocation*,
  not basic authentication. The token namespace is configured **not to evict** so rotation lineage
  is never silently dropped.

## Backend flow — first sign-in

```
POST /api/v1/auth/google
  → identity.infrastructure.web.AuthController
  → identity.application.RegisterOrSignInService (tx)
      → verify Google OIDC token (issuer, aud, exp)
      → Explorer not found → create aggregate (default prefs vi/light)
      → publish ExplorerRegistered           (recorded in event log, same tx)
  → issue access + refresh JWT
  ⇢ exploration / content / engagement / social listeners provision per-Explorer state (async)
```

`@ready` scenario *"Preferences persist across sessions"* is satisfied because preferences live on
the server-side Explorer, not the device — a new device reads them from `GET /me`.

## Mobile design ([feature `identity`](../frontend-architecture.md))

- **Navigation:** `AuthStack` (welcome → sign-in → register) before the app tabs; `ProfileTab`
  hosts preferences post-auth.
- **Screens:** Welcome, Sign-in (provider buttons: Email, Google), Register, Profile & Preferences.
- **Session:** access/refresh JWT in **secure storage**; a `shared/api` interceptor attaches the
  Bearer token, refreshes on 401, and sets `Accept-Language` from the active locale.
- **State:** React Query `['identity','me']`; changing language/theme optimistically updates the UI
  and `PUT`s preferences.
- **i18n/theme:** language + theme are driven **from** the Explorer's preferences once signed in,
  so the two stay in lockstep across devices.

## Open decisions

- **Account linking** across providers (same person, Google + Email) — is that one Explorer?
  Owner: Product · needed by P5 (can defer). Until decided, each provider ref is a distinct
  Explorer.
- **Facebook + Zalo** providers — fast-follow; adds `AuthProvider.kind` values + provider config.
