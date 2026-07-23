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

### 2. Hybrid Primary Key Strategy: TSID vs UUIDv7/v4

- **Decision**: Adopt a hybrid primary key strategy based on access patterns and security constraints:
  - **High-Write / High-Volume Tables** (`content.beats`, `content.reviews`, `social.feed_entries`, `social.reactions`, `engagement.notifications`): Use 64-bit **TSID** (`BIGINT`, 8 bytes storage).
  - **Core Security & Identity Tables** (`identity.explorers`, `identity.auth_providers`): Use 128-bit **UUIDv7 / UUIDv4** (`UUID`, 16 bytes storage).
  - **Administrative Reference Tables** (`exploration.provinces`, `exploration.wards`): Use ISO/standard string keys (e.g. `VN-HN`).
- **Rationale**:
  - **Storage & Index Performance (TSID)**: 64-bit `BIGINT` uses only 8 bytes vs 16 bytes for UUID (50% memory and disk saving). TSIDs are strictly time-sorted (Hyperscale/Twitter Snowflake concept), keeping PostgreSQL B-Tree indexes compact and eliminating index fragmentation during high-throughput writes.
  - **Security & Unguessability (UUIDv7/v4)**: Public-facing entity IDs (like Explorer user IDs) require unguessability to prevent enumeration attacks and object-level permission leaks on public endpoints.
- **Alternatives Considered**:
  - *UUIDv7 everywhere*: Rejected because 16-byte UUID indexes double memory usage and index size on multi-million row tables like `social.feed_entries` and `content.beats`.
  - *Auto-increment BIGINT everywhere*: Rejected due to sequence contention across schemas and predictable ID enumeration risks.

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
  - When `content` creates a `Beat` (TSID key), it publishes `BeatCapturedEvent`.
  - `exploration`, `engagement`, and `social` modules listen to `BeatCapturedEvent` in independent transactions and update their local schema tables (`exploration.collections`, `engagement.streaks`, `social.feeds`).

---

## Technical Summary Matrix

| Bounded Context | Schema Name | ID Strategy | Key Entities / Tables | Migration Path & Bean |
| :--- | :--- | :--- | :--- | :--- |
| **Identity** | `identity` | **UUIDv7 / UUIDv4** (16 B) | `explorers`, `auth_providers`, `preferences` | `db/migration/identity` (`identityFlyway`) |
| **Exploration** | `exploration` | **String ISO / TSID** (8 B) | `provinces` (String), `places` (TSID), `collections` (TSID) | `db/migration/exploration` (`explorationFlyway`) |
| **Content** | `content` | **TSID** (`BIGINT` 8 B) | `beats` (TSID), `reviews` (TSID), `memories` (TSID) | `db/migration/content` (`contentFlyway`) |
| **Engagement** | `engagement` | **TSID** (`BIGINT` 8 B) | `streaks` (UUID ref), `milestones` (TSID), `notifications` (TSID) | `db/migration/engagement` (`engagementFlyway`) |
| **Social** | `social` | **TSID** (`BIGINT` 8 B) | `friendships` (TSID), `reactions` (TSID), `feed_entries` (TSID) | `db/migration/social` (`socialFlyway`) |
