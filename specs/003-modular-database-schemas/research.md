# Phase 0 Research: Modular Database Schemas per Backend Context

**Feature**: Modular Database Schemas per Backend Context
**Branch**: `003-modular-database-schemas`
**Date**: 2026-07-23

## Research Topics & Findings

### 1. PostgreSQL Schema Partitioning Strategy in Spring Modulith

- **Decision**: Use a single PostgreSQL database instance with 5 distinct non-public schemas (`identity`, `exploration`, `content`, `engagement`, `social`) mapped 1-to-1 with Spring Modulith bounded contexts.
- **Rationale**:
  - Keeps operational overhead minimal for the current monolith stage while achieving complete logical data isolation.
  - Allows future microservice extraction by granting dedicated db credentials per schema or moving a schema to an independent PostgreSQL instance without modifying table DDL or JPA entity annotations.

### 2. Uniform Primary Key Strategy: UUIDv7 everywhere

> **Revised 2026-07-24.** This section originally specified a *hybrid* strategy — 8-byte TSIDs for
> high-volume tables, 16-byte UUIDs for identity tables. That was superseded before any production
> data existed. The full analysis and the numbers behind the reversal are in
> [ADR-0014](../../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/decisions/0014-uuidv7-primary-keys.md).

- **Decision**: One key type for the whole system — every generated primary key is a **UUIDv7**
  (RFC 9562), assigned by the application in `com.viego.shared.domain.BaseEntity` via Hibernate's
  `@UuidGenerator(style = VERSION_7)`. All cross-schema logical references are `UUID`.
  - **Administrative Reference Tables** (`exploration.provinces`, `exploration.wards`): keep their
    natural ISO string keys (e.g. `VN-HN`) — reference data with a stable external identifier does
    not get a surrogate key.
  - **Key-by-owner tables** (`identity.preferences`, `engagement.streaks`): keep `explorer_id` as
    the primary key; strictly one row per Explorer.
- **Rationale**:
  - **Time-ordered writes**: UUIDv7's 48-bit millisecond prefix keeps B-tree inserts at the right
    edge of the index — no page splits, no fragmentation. This is the property TSID was chosen for.
  - **Unguessable everywhere**: 74 random bits after the timestamp, on *every* entity rather than
    only on Explorers.
  - **Zero coordination**: no node-id configuration, no sequence contention, no DB round-trip; an
    aggregate has identity before it is persisted, and a module can be extracted without changing
    key generation.
  - **No client precision hazard**: a 64-bit id exceeds `Number.MAX_SAFE_INTEGER` and must be
    string-serialized or the React Native client silently rounds it. UUIDs are strings natively.
  - **Storage is not the binding constraint**: the full spread between an all-TSID and an
    all-UUIDv7 schema is ~3 GB/year on `social.feed_entries`, the only table where key width
    matters at all.
- **Alternatives Considered**:
  - *TSID/UUID hybrid* (the original decision): rejected — it does not narrow the hot composite
    indexes (which lead with an explorer UUID either way), leaves two key types and the JSON
    precision hazard permanently, and applies its own anti-enumeration rationale inconsistently
    (`/beats/{beatId}` exposes enumerable TSIDs).
  - *TSID everywhere*: the tightest schema, rejected because the ~1.4 GB/year it saves is too small
    to justify enumerable ids on security-critical tables, mandatory per-pod node configuration,
    and the 64-bit JSON hazard on every id.
  - *UUIDv4 everywhere*: rejected — random ids scatter inserts across the whole index, causing the
    page splits and bloat this schema set out to avoid.
  - *Auto-increment BIGINT everywhere*: rejected due to sequence contention across schemas and
    predictable ID enumeration risks.

### 3. Dedicated Flyway Migration Beans per Schema

- **Decision**: Configure 5 separate `@Bean` definitions for Flyway in Spring Boot (`identityFlyway`, `explorationFlyway`, `contentFlyway`, `engagementFlyway`, `socialFlyway`).
- **Rationale**:
  - Each Flyway Bean manages its own migration history table isolated within its schema (`identity.flyway_schema_history`, `exploration.flyway_schema_history`, etc.).
  - Guarantees 100% migration decoupling: when a module is extracted into a standalone microservice, its Flyway migration history transfers seamlessly without data splitting or history corruption.
- **Alternatives Considered**:
  - *Single global Flyway bean with multiple schema paths*: Rejected because all migration history would be mixed into a single `public.flyway_schema_history` table, breaking microservice migration independence.

### 4. Cross-Schema Data Synchronization via Event Backbone

- **Decision**: Synchronize cross-schema state exclusively using Spring Modulith Domain Events and `@ApplicationModuleListener` (backed by Spring Modulith Event Publication Registry for transactional outbox safety).
- **Rationale**:
  - When `content` creates a `Beat`, it publishes `BeatCapturedEvent`.
  - `exploration`, `engagement`, and `social` modules listen to `BeatCapturedEvent` in independent transactions and update their local schema tables (`exploration.collections`, `engagement.streaks`, `social.feeds`).

---

## Technical Summary Matrix

| Bounded Context | Schema Name | ID Strategy | Key Entities / Tables | Migration Path & Bean |
| :--- | :--- | :--- | :--- | :--- |
| **Identity** | `identity` | **UUIDv7** | `explorers`, `auth_providers`, `preferences` (keyed by `explorer_id`) | `db/migration/identity` (`identityFlyway`) |
| **Exploration** | `exploration` | **UUIDv7**, natural ISO keys for geography | `provinces` (ISO), `wards` (ISO), `places`, `collections` | `db/migration/exploration` (`explorationFlyway`) |
| **Content** | `content` | **UUIDv7** | `beats`, `reviews`, `memories` | `db/migration/content` (`contentFlyway`) |
| **Engagement** | `engagement` | **UUIDv7** | `streaks` (keyed by `explorer_id`), `milestones`, `notifications` | `db/migration/engagement` (`engagementFlyway`) |
| **Social** | `social` | **UUIDv7** | `friendships`, `invite_links`, `reactions`, `feed_entries` | `db/migration/social` (`socialFlyway`) |
