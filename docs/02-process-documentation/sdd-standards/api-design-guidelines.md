---
title: "API Design Guidelines"
description: "Conventions for REST/OpenAPI and event/AsyncAPI contracts."
---

# API Design Guidelines

## REST (OpenAPI)
- Resource-oriented, plural nouns: `/api/v1/provinces`, `/api/v1/collection/me`, `/api/v1/streaks/me`.
- **Versioning:** URI prefix `/api/v1/...`; breaking changes bump the version. Never break
  `/api/v1` for released mobile clients.
- **Auth:** Bearer JWT; `me` resolves to the authenticated Explorer.
- **Localization:** `Accept-Language` (vi/en) drives `LocalizedText` rendering.
- **Pagination:** cursor or `page`/`size`; envelope `{ items, page, total }`.
- **Errors:** RFC 9457 Problem Details (`application/problem+json`).
- **DTOs only** across the wire — never serialize JPA entities or domain aggregates.

## URL ownership by module
| Prefix | Module |
|--------|--------|
| `/api/v1/auth`, `/api/v1/explorers` | identity |
| `/api/v1/provinces`, `/api/v1/collection`, `/api/v1/places`, `/api/v1/search` | exploration |
| `/api/v1/beats`, `/api/v1/memories`, `/api/v1/places/{id}/reviews` | content |
| `/api/v1/streaks`, `/api/v1/notifications` | engagement |
| `/api/v1/feed`, `/api/v1/discover`, `/api/v1/friends` | social |

## Events (AsyncAPI)
- Past-tense names in `<module>.api.events`; payloads carry **ids/primitives only**.
- Publish via the transactional outbox; consume with `@ApplicationModuleListener`.
- Every event is in the
  [AsyncAPI catalog](../../01-product-documentation/01-core-specifications/api-system-specifications/domain-events.asyncapi.yaml).

## Linting & contract
- OpenAPI/AsyncAPI are linted in CI (e.g. Spectral).
- The spec is the source of truth; clients and contract tests are generated from it.
