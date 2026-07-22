---
title: "ADR 0009 — Spring Boot 4 + Spring CLI scaffolding"
description: "Adopt Spring Boot 4 (superseding the 3.x pin in ADR-0004) and scaffold the backend with the Spring CLI."
---

# ADR 0009 — Spring Boot 4 + Spring CLI scaffolding

- **Status:** Accepted · **Date:** 2026-07-22 · **Deciders:** VieGo team
- **Supersedes:** [ADR 0004](0004-java-and-spring-boot.md) (framework version + build-tooling only —
  the Java 25 and Maven choices carry over unchanged).

## Context
[ADR-0004](0004-java-and-spring-boot.md) selected **Java 25 + Spring Boot 3.x + Maven**. Since then
**Spring Boot 4** is the target for a greenfield backend that has not yet been scaffolded (Phase 0
has not started), so there is no migration cost — we simply start on 4. We also want the initial
project generated in a **reproducible, standard** way rather than hand-assembled.

## Decision
- Adopt **Spring Boot 4** as the backend framework (replaces the `3.x` pin in ADR-0004). Java 25 (LTS)
  and **Maven** are retained from ADR-0004.
- Spring Modulith (boundaries + events), Spring Data JPA, Spring Security, and springdoc (OpenAPI)
  remain the module set, on their Spring Boot 4-compatible versions.
- **Scaffold the backend with the Spring CLI**, not by hand:
  - `spring boot new <name>` (Spring CLI) to create the project, or `spring init` (Initializr-backed)
    with the equivalent dependency set (`web`, `modulith`, `data-jpa`, `postgresql`, `flyway`,
    `actuator`, `security`, `validation`, `testcontainers`).
  - Pin **Spring Boot 4** and **Java 25** in the generated `pom.xml`.
  - This is a one-time Phase 0 [T004](../../../../../specs/001-phase-0-walking-skeleton/tasks.md) step;
    later modules are added within the generated project, not re-scaffolded.

## Consequences
- **+** Latest framework baseline (no future 3→4 migration); reproducible, standard project layout.
- **+** Spring CLI keeps the scaffold aligned with current starter/dependency versions.
- **−** Requires the Spring CLI available in the dev/CI toolchain (documented in the
  [quickstart](../../../../../specs/001-phase-0-walking-skeleton/quickstart.md)).
- **−** Spring Boot 4 is newer; watch for library compatibility (springdoc, Testcontainers) and pin
  known-good versions.

## Alternatives
- **Stay on Spring Boot 3.x** (ADR-0004) — rejected: greenfield, so no reason to start a major version
  behind and incur a later migration.
- **Hand-authored `pom.xml`** — rejected: drifts from current starters; the CLI scaffold is
  reproducible and faster.

## Notes
ADR-0004's Java 25 + Maven decision and its modular-monolith rationale remain authoritative; only the
Spring Boot **version** and the **scaffolding method** are updated here.
