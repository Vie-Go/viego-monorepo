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

### User Story 2 - Optimized Hybrid Primary Key Strategy (Priority: P2)

As a database architect, I want high-write frequency tables (in `content`, `engagement`, `social`) to use 64-bit TSIDs (`BIGINT`, 8 bytes) for index & storage performance, while core identity entities use `UUIDv7`/`UUIDv4` (16 bytes) for public unguessability and security.

**Why this priority**: Optimizes memory, disk, and index B-tree performance for high-throughput tables while safeguarding user identity data against enumeration attacks on public APIs.

**Independent Test**: Verified by inspecting database column data types: high-frequency tables (`content.beats`, `social.feed_entries`) store primary keys as 8-byte `BIGINT` (TSID) while core accounts (`identity.explorers`) use 16-byte `UUID`.

**Acceptance Scenarios**:

1. **Given** high-volume tables (`beats`, `reviews`, `feed_entries`, `notifications`), **When** records are inserted, **Then** primary keys are generated as 64-bit time-sorted TSIDs (`BIGINT`).
2. **Given** security-sensitive tables (`explorers`, `auth_providers`), **When** user profiles are created, **Then** primary keys are generated as unguessable 128-bit `UUID`s.

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
- How does the system handle TSID identifier collisions? TSID generation includes node/worker IDs and time counters guaranteeing global uniqueness across application nodes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST organize all backend database tables into distinct database schemas matching domain bounded contexts: `identity`, `exploration`, `content`, `engagement`, and `social`.
- **FR-002**: System MUST prohibit database foreign key constraints across different schema boundaries.
- **FR-003**: System MUST implement a hybrid primary key strategy:
  - High-write frequency tables (`beats`, `reviews`, `memories`, `notifications`, `milestones`, `feed_entries`, `reactions`) MUST use 64-bit TSID (`BIGINT`, 8 bytes storage).
  - Security-sensitive core user tables (`explorers`, `auth_providers`) MUST use 128-bit `UUID` (`UUIDv7`/`UUIDv4`, 16 bytes storage).
  - Spatial reference entities (`provinces`, `wards`) MUST use standard string keys.
- **FR-004**: System MUST configure 5 separate Flyway migration beans (`identityFlyway`, `explorationFlyway`, `contentFlyway`, `engagementFlyway`, `socialFlyway`) maintaining isolated `flyway_schema_history` tables within each schema namespace.
- **FR-005**: System MUST support cross-schema data synchronization exclusively via published domain events or application-level APIs.

### Key Entities *(include if feature involves data)*

- **Identity Schema Entities** (ID Type: `UUID`):
  - `Explorer`: User account details, unique handle, active status.
  - `AuthProvider`: External auth bindings (email, Google, Facebook, Zalo) linked to Explorer UUID.
  - `Preferences`: Explorer interface language and theme settings.
- **Exploration Schema Entities** (ID Type: String / TSID):
  - `Province`: Geographic region metadata (String ID).
  - `Ward`: Sub-region within a province (String ID).
  - `Place`: Point of interest with location coordinates (TSID `BIGINT`).
  - `Collection`: Explorer's set of unlocked provinces (TSID `BIGINT`).
- **Content Schema Entities** (ID Type: TSID `BIGINT`):
  - `Beat`: Photo check-in capture (TSID `BIGINT`).
  - `Review`: Written visitor feedback for a Place (TSID `BIGINT`).
  - `Memory`: Time-ordered personal history record (TSID `BIGINT`).
- **Engagement Schema Entities** (ID Type: TSID `BIGINT`):
  - `Streak`: Consecutive activity day counter per Explorer UUID (`PRIMARY KEY = explorer_id`).
  - `Milestone`: Achievement badge unlocked by streak progress (TSID `BIGINT`).
  - `Notification`: System and social activity notifications queued for Explorer (TSID `BIGINT`).
- **Social Schema Entities** (ID Type: TSID `BIGINT`):
  - `Friendship`: Mutual connection record between two Explorer UUIDs (TSID `BIGINT`).
  - `InviteLink`: Shareable handle or code for establishing friendships (TSID `BIGINT`).
  - `Reaction`: Heart or bolt response to a specific Beat ID (TSID `BIGINT`).
  - `FeedEntry`: Stream entry linking a Beat ID to feed subscribers (TSID `BIGINT`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of backend database tables are partitioned into domain-specific schemas with zero tables created in the default public schema.
- **SC-002**: 0 cross-schema foreign key constraints exist across the database.
- **SC-003**: 5 separate Flyway migration beans operate independently, maintaining isolated `flyway_schema_history` tables inside their respective schema namespaces.
- **SC-004**: High-write tables store primary keys as 64-bit `BIGINT` TSID, achieving 50% index storage reduction compared to 16-byte UUIDs.

## Assumptions

- PostgreSQL 16+ is used as the primary relational database system supporting schema namespaces and 64-bit `BIGINT` TSIDs.
- TSID (Time-Sorted ID) generator library is integrated in Spring Boot for fast, zero-lock 64-bit ID generation.
- Cross-module communication and data synchronization rely on Spring Modulith published domain events.
