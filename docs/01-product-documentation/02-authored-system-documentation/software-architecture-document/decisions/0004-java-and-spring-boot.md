---
title: "ADR 0004 — Java 25 + Spring Boot as backend platform"
description: "Use Java 25 (LTS) with Spring Boot 3.x and Maven for the backend."
---

# ADR 0004 — Java 25 + Spring Boot as backend platform

- **Status:** Superseded by [ADR 0009](0009-spring-boot-4-and-spring-cli-scaffolding.md) · **Date:** 2026-07-22 · **Deciders:** VieGo team

> **Superseded (framework version only):** the Spring Boot **3.x** pin below is replaced by
> **Spring Boot 4** in [ADR 0009](0009-spring-boot-4-and-spring-cli-scaffolding.md), which also adds
> Spring CLI scaffolding. The **Java 25** and **Maven** decisions here remain authoritative. Per the
> ADR convention this record is left intact (immutable); only its status changes.

## Context
We need a mature backend platform with strong modularity tooling, a large hiring pool, and
first-class support for the [modular-monolith approach](0002-modular-monolith-with-spring-modulith.md).

## Decision
Use **Java 25 (LTS)** with **Spring Boot 3.x**:
- Spring Modulith for boundaries and event-driven integration.
- Spring Data JPA (persistence), Spring Security (auth), springdoc (OpenAPI).
- **Maven** build.
- Modern Java (virtual threads, records, sealed types, pattern matching) for concise domain
  modelling and scalable I/O.

## Consequences
- **+** First-class Spring Modulith support; virtual threads simplify concurrency; records/sealed
  types fit DDD value objects and events.
- **+** Huge ecosystem and talent pool; long-term support.
- **−** JVM footprint/startup vs. lighter runtimes (mitigate later with AOT/native if needed).

## Alternatives
- **Kotlin + Spring** — viable; deferred to keep the initial stack conventional (can be adopted
  per-module later).
- **Node/NestJS, Go** — weaker modular-monolith tooling for our chosen pattern.
