# Tasks: Modular Database Schemas per Backend Context

**Input**: Design documents from `/specs/003-modular-database-schemas/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`, `[US3]`)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Infrastructure setup for multi-schema database architecture & Flyway configuration

- [x] T001 Create Flyway migration directory structure for module schemas in backend/src/main/resources/db/migration/
- [x] T002 [P] Create database initialization script for local development in backend/src/main/resources/db/init-schemas.sql
- [x] T003 [P] Configure 5 separate Flyway Spring @Bean instances (identityFlyway, explorationFlyway, contentFlyway, engagementFlyway, socialFlyway) in backend/src/main/java/com/viego/shared/config/FlywayConfig.java

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core ORM, TSID generator, and testing infrastructure that MUST be complete before user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Setup PostgreSQL PostGIS and JPA Dialect configuration in backend/src/main/java/com/viego/shared/config/DatabaseConfig.java
- [x] T005 [P] Integrate 64-bit TSID generator and base entity classes in backend/src/main/java/com/viego/shared/domain/BaseTsidEntity.java
- [x] T006 [P] Configure Spring Modulith module verification test harness in backend/src/test/java/com/viego/ApplicationModulesTest.java

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Backend Developer Module Data Isolation & Hybrid Keys (Priority: P1) 🎯 MVP

**Goal**: Create 5 isolated PostgreSQL schemas with 5 separate Flyway beans and hybrid TSID (`BIGINT` 8B) vs UUID (16B) entity mappings.

**Independent Test**: Run `ApplicationModulesTest.java` and `SchemaIsolationTest.java` to verify all 5 schemas migrate with 5 isolated `flyway_schema_history` tables and 0 cross-schema FKs.

### Implementation for User Story 1

- [x] T007 [P] [US1] Write identity schema Flyway migration script (UUID keys) in backend/src/main/resources/db/migration/identity/V1__init_identity_schema.sql
- [x] T008 [P] [US1] Write exploration schema Flyway migration script (String & TSID keys) in backend/src/main/resources/db/migration/exploration/V1__init_exploration_schema.sql
- [x] T009 [P] [US1] Write content schema Flyway migration script (TSID BIGINT keys) in backend/src/main/resources/db/migration/content/V1__init_content_schema.sql
- [x] T010 [P] [US1] Write engagement schema Flyway migration script (TSID BIGINT keys) in backend/src/main/resources/db/migration/engagement/V1__init_engagement_schema.sql
- [x] T011 [P] [US1] Write social schema Flyway migration script (TSID BIGINT keys) in backend/src/main/resources/db/migration/social/V1__init_social_schema.sql
- [x] T012 [P] [US1] Map identity domain entities (Explorer, AuthProvider, Preferences with UUID PKs) in backend/src/main/java/com/viego/identity/domain/
- [x] T013 [P] [US1] Map exploration domain entities (Province, Ward, Place, Collection with TSID/String PKs) in backend/src/main/java/com/viego/exploration/domain/
- [x] T014 [P] [US1] Map content domain entities (Beat, Review, Memory with TSID BIGINT PKs) in backend/src/main/java/com/viego/content/domain/
- [x] T015 [P] [US1] Map engagement domain entities (Streak, Milestone, Notification with TSID BIGINT PKs) in backend/src/main/java/com/viego/engagement/domain/
- [x] T016 [P] [US1] Map social domain entities (Friendship, InviteLink, Reaction, FeedEntry with TSID BIGINT PKs) in backend/src/main/java/com/viego/social/domain/
- [x] T017 [US1] Implement information schema integration test verifying 5 separate flyway_schema_history tables and 0 cross-schema FKs in backend/src/test/java/com/viego/shared/SchemaIsolationTest.java

**Checkpoint**: User Story 1 complete - all 5 domain schemas created, 5 Flyway beans active, and hybrid TSID/UUID keys mapped.

---

## Phase 4: User Story 2 - Cross-Module Asynchronous Data Synchronization (Priority: P2)

**Goal**: Synchronize data across schemas using Spring Modulith published domain events instead of relational database foreign keys.

**Independent Test**: Publish `BeatCapturedEvent` from `content` module and verify that `exploration.collections`, `engagement.streaks`, and `social.feed_entries` update asynchronously.

### Implementation for User Story 2

- [x] T018 [P] [US2] Define BeatCapturedEvent domain contract (with TSID & UUID references) in backend/src/main/java/com/viego/content/domain/event/BeatCapturedEvent.java
- [x] T019 [US2] Implement Beat capture event publisher in backend/src/main/java/com/viego/content/service/BeatCaptureService.java
- [x] T020 [P] [US2] Implement exploration event listener for province unlocks in backend/src/main/java/com/viego/exploration/listener/BeatCapturedExplorationListener.java
- [x] T021 [P] [US2] Implement engagement event listener for streak progress in backend/src/main/java/com/viego/engagement/listener/BeatCapturedEngagementListener.java
- [x] T022 [P] [US2] Implement social event listener for feed fan-out in backend/src/main/java/com/viego/social/listener/BeatCapturedSocialListener.java
- [x] T023 [US2] Integration test for BeatCapturedEvent cross-module event propagation in backend/src/test/java/com/viego/content/BeatCapturedEventPropagationTest.java

**Checkpoint**: User Story 2 complete - cross-schema event synchronization functioning asynchronously.

---

## Phase 5: User Story 3 - Independent Service Extraction Readiness (Priority: P3)

**Goal**: Ensure any module schema can be extracted to a separate database instance without DDL modifications or missing table dependencies.

**Independent Test**: Run Flyway migrations for `identityFlyway` in an isolated database container and verify full standalone execution.

### Implementation for User Story 3

- [x] T024 [P] [US3] Add standalone schema Flyway runner test in backend/src/test/java/com/viego/shared/StandaloneSchemaMigrationTest.java
- [x] T025 [US3] Document microservices extraction playbook in docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/service-extraction-playbook.md

**Checkpoint**: User Story 3 complete - schema extraction validated.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Architecture validation and documentation polish

- [x] T026 [P] Update Spring Modulith architecture documentation in docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/backend-modular-monolith.md
- [x] T027 Run quickstart verification script against local PostgreSQL in backend/src/test/java/com/viego/shared/QuickstartValidationTest.java

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on User Story 1, 2, and 3 completion

### Parallel Opportunities

- **Flyway Beans**: T003 configures 5 independent beans
- **Flyway DDL Tasks**: T007, T008, T009, T010, T011 can be authored in parallel
- **JPA Entity Mapping Tasks**: T012, T013, T014, T015, T016 can be authored in parallel
- **Event Listeners**: T020, T021, T022 can be authored in parallel
