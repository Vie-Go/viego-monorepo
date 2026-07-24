# Implementation Plan: Modular Database Schemas per Backend Context

**Branch**: `003-modular-database-schemas` | **Date**: 2026-07-23 | **Spec**: [spec.md](file:///d:/Project/Personal/VieGo/viego-monorepo/specs/003-modular-database-schemas/spec.md)

**Input**: Feature specification from `/specs/003-modular-database-schemas/spec.md`

## Summary

Implement 5 isolated PostgreSQL schemas (`identity`, `exploration`, `content`, `engagement`, `social`) mapped 1-to-1 with Spring Modulith backend modules. Configure 5 separate Flyway Spring `@Bean` instances (`identityFlyway`, `explorationFlyway`, `contentFlyway`, `engagementFlyway`, `socialFlyway`) to manage migration history tables independently inside each schema. Use a single primary key type across all five schemas: application-generated, time-ordered **UUIDv7** (ADR-0014), with natural ISO keys retained for `exploration.provinces` / `wards`.

## Technical Context

**Language/Version**: Java 25 (Spring Boot 3.4+)

**Primary Dependencies**: Spring Modulith, Hibernate/JPA, Flyway Migration (5 separate Beans), Lombok, Jackson, PostGIS (for spatial coordinates)

**Storage**: PostgreSQL 16+ (Multi-schema partitioning: `identity`, `exploration`, `content`, `engagement`, `social`)

**Testing**: JUnit 5, Spring Modulith `ApplicationModules.verify()`, Testcontainers (PostgreSQL)

**Target Platform**: Linux Server / Docker Container / Kubernetes

**Project Type**: Spring Boot Modular Monolith Web Application

**Performance Goals**: Support 1,000 concurrent DB queries/sec with zero cross-schema lock contention; time-ordered UUIDv7 keys keep B-tree inserts at the index right edge

**Constraints**: Prohibit all cross-schema foreign keys; 5 separate Flyway Beans MUST manage isolated `flyway_schema_history` tables per schema

**Scale/Scope**: 5 PostgreSQL schemas, 5 Flyway migration beans, 15 core database tables across 5 bounded contexts

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify this plan against the VieGo Documentation Constitution (`.specify/memory/constitution.md`):

- [x] **I. Specs are source of truth** — Behavior originates in Core Specifications; spec defined in `specs/003-modular-database-schemas/spec.md`.
- [x] **II. Ubiquitous language** — Uses exact terms (`Explorer`, `Beat`, `Province`, `Streak`, `Friendship`) matching `ddd-and-domain-model.md`.
- [x] **III. Architecture & module boundaries** — Satisfies Spring Modulith module boundaries; database schemas strictly mirror backend modules (`identity`, `exploration`, `content`, `engagement`, `social`); `ApplicationModules.verify()` stays green.
- [x] **IV. Documentation conventions** — Specs and plans generated under `specs/003-modular-database-schemas/` with required section headers.
- [x] **V. Immutable decisions & spec-first change flow** — Specifications and architecture plans authored before implementation.

## Project Structure

### Documentation (this feature)

```text
specs/003-modular-database-schemas/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── data-schemas-er-diagram.md
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
backend/
├── src/main/java/com/viego/
│   ├── shared/
│   │   └── config/
│   │       ├── DatabaseConfig.java   # PostGIS & JPA Dialect configuration
│   │       └── FlywayConfig.java     # 5 Separate Flyway @Bean definitions
│   ├── identity/
│   │   └── domain/                   # Identity entities (@Table(schema = "identity"), UUID PK)
│   ├── exploration/
│   │   └── domain/                   # Exploration entities (@Table(schema = "exploration"), ISO/UUIDv7 PK)
│   ├── content/
│   │   └── domain/                   # Content entities (@Table(schema = "content"), UUIDv7 PK)
│   ├── engagement/
│   │   └── domain/                   # Engagement entities (@Table(schema = "engagement"), UUIDv7 PK)
│   └── social/
│       └── domain/                   # Social entities (@Table(schema = "social"), UUIDv7 PK)
└── src/main/resources/
    └── db/migration/
        ├── identity/                 # Flyway V1__identity_schema.sql (managed by identityFlyway)
        ├── exploration/              # Flyway V1__exploration_schema.sql (managed by explorationFlyway)
        ├── content/                  # Flyway V1__content_schema.sql (managed by contentFlyway)
        ├── engagement/               # Flyway V1__engagement_schema.sql (managed by engagementFlyway)
        └── social/                   # Flyway V1__social_schema.sql (managed by socialFlyway)
```

**Structure Decision**: Monorepo backend layout using Spring Modulith package structure with 5 separate Flyway migration beans and uniform UUIDv7 entity mapping via a shared `BaseEntity`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
| :--- | :--- | :--- |
| None | N/A | N/A |
