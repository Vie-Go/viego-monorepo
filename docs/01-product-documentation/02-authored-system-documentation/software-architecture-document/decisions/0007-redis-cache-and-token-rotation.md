---
title: "ADR 0007 — Redis for caching and token rotation"
description: "Redis as a non-authoritative cache for hot and slow-changing reads, and as the server-side store for refresh-token rotation."
---

# ADR 0007 — Redis for caching and token rotation

- **Status:** Proposed · **Date:** 2026-07-22 · **Deciders:** VieGo team

## Context
[PostgreSQL](0005-postgresql-and-event-driven-integration.md) is the primary datastore, but two
access patterns are a poor fit for hitting it on every request:

- **Frequently accessed, slow-changing reads** — the province/ward map data, a Province's heritage
  metadata, and `LocalizedText` are read on almost every session yet change rarely (data that is
  read constantly but *rarely written* is the classic cache candidate). Serving these from Postgres
  every time wastes DB capacity and adds latency ([NFR-PERF-01/02](../../../01-core-specifications/requirements/non-functional-requirements.md#nfr-perf--performance)).
- **Refresh-token rotation** — [Identity](../design/identity.md) issues short-lived access JWTs plus
  rotating refresh tokens ([FR-ID-04](../../../01-core-specifications/requirements/functional-requirements.md#fr-id--identity-authentication)).
  Rotation with **reuse detection** and **revocation** needs fast, shared, expiring server-side
  state — again not a natural relational-table workload.

We need one component that serves both without violating the
[module-ownership principles](../architecture-principles.md) (modules own their data; no shared
tables; extraction-ready).

## Decision (proposed)
Introduce **Redis** as an in-memory store with two clearly separated roles. **Redis is never the
source of truth** — PostgreSQL is; Redis is an accelerator and a store for inherently ephemeral
state.

### 1. Application cache (cache-aside / read-through)
- Cache hot, slow-changing read models: **provinces list + geometry** ([FR-EX-01](../../../01-core-specifications/requirements/functional-requirements.md#fr-ex--exploration-province-unlocking)),
  **heritage metadata** ([FR-CO-01](../../../01-core-specifications/requirements/functional-requirements.md#fr-co--content-heritage-access)),
  **`LocalizedText`**, and per-Explorer read models (e.g. `me`, collection) where worthwhile.
- Access via Spring's cache abstraction (`@Cacheable`) backed by a Redis `CacheManager`
  (Spring Data Redis / Lettuce).
- **Invalidation is event-driven, not just TTL:** domain-event listeners evict the affected keys —
  `ProvinceUnlocked` evicts that Explorer's collection/map cache, `PreferencesUpdated` evicts `me`,
  a content update evicts that province's heritage. Every cached entry also carries a **TTL** as a
  backstop.
- **Correctness must not depend on the cache:** a miss (or a Redis outage) falls back to Postgres —
  degraded latency, never wrong or unavailable data.

### 2. Token rotation & auth hot-path state
- Store the **refresh-token rotation family** (current handle + lineage) with **reuse detection**:
  presenting a superseded/rotated token invalidates the whole family.
- Short-lived **denylist** of revoked access-token `jti`s (bounded by the access-token TTL) for
  immediate logout/revocation.
- **Rate-limit counters** for auth and unlock endpoints ([NFR-SEC-07](../../../01-core-specifications/requirements/non-functional-requirements.md#nfr-sec--security--privacy)).

### Ownership & boundaries
- Redis is **shared infrastructure but partitioned by module**: each module uses its own **key
  namespace** (`identity:*`, `exploration:*`, `content:*`, …); **no module reads another module's
  keys** — the same discipline as [schema-per-module](0005-postgresql-and-event-driven-integration.md).
- **Extraction-ready:** on [service extraction](../service-extraction-playbook.md) a module takes its
  keyspace (or its own Redis instance) with it, unchanged.
- Managed Redis in dev/staging/prod; Docker Compose locally. TLS + AUTH; a per-role **eviction
  policy** (`allkeys-lru` for the cache namespace; **no eviction / persistence** for the token
  namespace so rotation state is not silently dropped).

## Consequences
- **+** Lower read latency and reduced DB load for the hottest, slowest-changing data
  ([NFR-PERF-02](../../../01-core-specifications/requirements/non-functional-requirements.md#nfr-perf--performance)).
- **+** Proper server-side **refresh-token rotation with reuse detection** and central revocation
  ([NFR-SEC](../../../01-core-specifications/requirements/non-functional-requirements.md#nfr-sec--security--privacy)); a ready primitive for **rate limiting**.
- **−** A new component to operate and secure (memory limits, eviction, TLS/AUTH, failover).
- **−** **Cache-invalidation complexity**; mitigated by event-driven eviction + TTL, and by treating
  the cache as non-authoritative.
- **−** The auth hot path gains a Redis dependency; mitigated by keeping access tokens self-validating
  (signature + `exp`) so only *revocation* and *rotation*, not basic auth, need Redis.

## Open questions
- Managed Redis provider/region; single clustered instance with per-module namespaces vs. separate
  instances per module.
- Durability of the refresh-token family: Redis with AOF persistence vs. a Postgres-backed table with
  Redis as a fast front — the token store trades some durability for speed and must not lose rotation
  lineage.
- Cache key/TTL policy per read model (owned in each module's design).
