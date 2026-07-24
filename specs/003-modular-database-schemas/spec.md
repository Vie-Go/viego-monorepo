# Feature Specification: Modular Database Schemas per Backend Context

**Feature Branch**: `003-modular-database-schemas`

**Created**: 2026-07-23

**Status**: Draft

**Input**: User description: "I want to design database diagram. Could you please separate the database to the schema list with each schema will belong to a module of backend (content, engagement, exploration, identity,...) because i want to upgrade to micorservices architecture in the future. Prioritize using TSID (8 bytes) for high-write tables and UUID for identity core tables, managed by 5 separate Flyway beans."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Backend Developer Module Data Isolation (Priority: P1)

As a backend engineer, I want each domain module (`identity`, `exploration`, `content`, `engagement`, `social`) to own its own isolated database schema managed by dedicated Flyway migration beans so that schema updates, queries, and table models are encapsulated within their respective domain boundaries.

**Why this priority**: Core architectural foundation for maintaining modular monolith boundaries and preventing data model coupling across context boundaries.

**Independent Test**: Can be validated by verifying that each module manages its tables within its dedicated schema namespace with its own `flyway_schema_history` table and operates independently without direct database references to other schemas.

**Acceptance Scenarios**:

1. **Given** a database initialized for the backend, **When** database tables are created, **Then** all tables are partitioned into specific domain schemas (`identity`, `exploration`, `content`, `engagement`, `social`) rather than a single shared public schema.
2. **Given** 5 domain schemas, **When** migrations execute, **Then** 5 separate Flyway beans manage migrations independently, creating isolated `flyway_schema_history` tables within each respective schema.

---

### User Story 2 - Uniform Time-Ordered Primary Key Strategy (Priority: P2)

> **Revised 2026-07-24.** This story originally specified a *hybrid* strategy (8-byte TSIDs for
> high-write tables, 16-byte UUIDs for identity tables), per the feature Input above. It was
> replaced by a single uniform key type before any production data existed — see
> [ADR-0014](../../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/decisions/0014-uuidv7-primary-keys.md).

As a database architect, I want every generated primary key in the system to be a time-ordered, unguessable **UUIDv7** assigned by the application, so that index inserts stay at the B-tree right edge, no id is enumerable, and no module needs coordination (node ids, sequences) to mint keys.

**Why this priority**: One key type removes a permanent class of mistakes — mixed id types at joins, per-node generator configuration, and 64-bit ids silently losing precision in the JavaScript client — while keeping the index-locality property the original TSID choice was made for.

**Independent Test**: Verified by inspecting database column data types: every generated primary key column (`identity.explorers`, `content.beats`, `social.feed_entries`, ...) is `UUID`, and only `exploration.provinces` / `exploration.wards` use natural ISO string keys.

**Acceptance Scenarios**:

1. **Given** any table with a generated key, **When** a record is inserted, **Then** its primary key is a UUIDv7 whose timestamp prefix orders it after previously inserted rows.
2. **Given** geographic reference tables (`provinces`, `wards`), **When** they are seeded, **Then** they retain their natural ISO administrative codes rather than surrogate keys.
3. **Given** owner-keyed tables (`identity.preferences`, `engagement.streaks`), **When** a row is created, **Then** its primary key is the owning `explorer_id`, not a new surrogate key.

---

### User Story 3 - Independent Service Extraction Readiness (Priority: P3)

As a DevOps engineer, I want to be able to extract any individual module schema into its own standalone database instance in the future without renaming tables or refactoring internal column schemas or migration history.

**Why this priority**: Enables smooth evolution from modular monolith to microservices architecture as traffic scales.

**Independent Test**: Can be tested by provisioning a separate database container for a single schema (e.g., `identity`) and executing its dedicated Flyway bean migration independently.

**Acceptance Scenarios**:

1. **Given** a decision to deploy a module as an independent microservice, **When** its schema is migrated to a distinct database server, **Then** its dedicated Flyway bean executes cleanly using its own `flyway_schema_history` table.

---

### Edge Cases

- What happens when a user account is deleted in `identity`? Downstream schemas MUST handle cascading soft-deletes or anonymization via domain events (`ExplorerDeleted`) rather than SQL `ON DELETE CASCADE`.
- How does the system handle identifier collisions? UUIDv7 carries 74 random bits after its millisecond timestamp, so collisions are negligible without any per-node configuration or coordination between application instances.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST organize all backend database tables into distinct database schemas matching domain bounded contexts: `identity`, `exploration`, `content`, `engagement`, and `social`.
- **FR-002**: System MUST prohibit database foreign key constraints across different schema boundaries.
- **FR-003**: System MUST use a single primary key strategy across all schemas:
  - Every generated primary key MUST be a **UUIDv7** (RFC 9562), assigned by the application, defined once in a shared `BaseEntity`.
  - All cross-schema logical references (`explorer_id`, `beat_id`, `place_id`, ...) MUST be `UUID`.
  - Spatial reference entities (`provinces`, `wards`) MUST keep their natural ISO string keys.
  - Owner-keyed entities (`preferences`, `streaks`) MUST use `explorer_id` as their primary key.
- **FR-004**: System MUST configure 5 separate Flyway migration beans (`identityFlyway`, `explorationFlyway`, `contentFlyway`, `engagementFlyway`, `socialFlyway`) maintaining isolated `flyway_schema_history` tables within each schema namespace.
- **FR-005**: System MUST support cross-schema data synchronization exclusively via published domain events or application-level APIs.

### Key Entities *(include if feature involves data)*

All generated keys are UUIDv7; only the exceptions are called out below.

- **Identity Schema Entities**:
  - `Explorer`: User account details, unique handle, active status.
  - `AuthProvider`: External auth bindings (email, Google, Facebook, Zalo) linked to an Explorer.
  - `Preferences`: Explorer interface language and theme settings (`PRIMARY KEY = explorer_id`).
- **Exploration Schema Entities**:
  - `Province`: Geographic region metadata (**natural ISO key**, e.g. `VN-HN`).
  - `Ward`: Sub-region within a province (**natural ISO key**).
  - `Place`: Point of interest with location coordinates.
  - `Collection`: Explorer's set of unlocked provinces.
- **Content Schema Entities**:
  - `Beat`: Photo check-in capture.
  - `Review`: Written visitor feedback for a Place.
  - `Memory`: Time-ordered personal history record.
- **Engagement Schema Entities**:
  - `Streak`: Consecutive activity day counter per Explorer (`PRIMARY KEY = explorer_id`).
  - `Milestone`: Achievement badge unlocked by streak progress.
  - `Notification`: System and social activity notifications queued for an Explorer.
- **Social Schema Entities**:
  - `Friendship`: Mutual connection record between two Explorers.
  - `InviteLink`: Shareable handle or code for establishing friendships.
  - `Reaction`: Heart or bolt response to a specific Beat.
  - `FeedEntry`: Stream entry linking a Beat to feed subscribers.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of backend database tables are partitioned into domain-specific schemas with zero tables created in the default public schema.
- **SC-002**: 0 cross-schema foreign key constraints exist across the database.
- **SC-003**: 5 separate Flyway migration beans operate independently, maintaining isolated `flyway_schema_history` tables inside their respective schema namespaces.
- **SC-004**: Every generated primary key column in the database is of type `UUID`; the only non-`UUID` keys are the natural ISO codes on `exploration.provinces` and `exploration.wards`.
- **SC-005**: Ids generated within a single process are strictly increasing over time, so sequential inserts append at the right edge of the primary key index rather than scattering across it.

## Assumptions

- PostgreSQL 16+ is used as the primary relational database system supporting schema namespaces and a native `UUID` type. (Postgres 18 adds a server-side `uuidv7()`; keys are generated in the application regardless, so no migration is implied.)
- Hibernate 7.1+ (resolved by Spring Boot 4.0) provides `@UuidGenerator(style = VERSION_7)` for zero-coordination, application-side key generation.
- Cross-module communication and data synchronization rely on Spring Modulith published domain events.
