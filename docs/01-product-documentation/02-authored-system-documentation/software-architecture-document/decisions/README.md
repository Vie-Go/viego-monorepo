---
title: "Architecture Decision Records (ADRs)"
description: "Significant technical decisions — the choice, context, and consequences."
---

# Architecture Decision Records (ADRs)

Significant technical decisions with their context and consequences. ADRs are **immutable** — to
change a decision, add a new ADR that supersedes the old one.

| # | Title | Status |
|---|-------|--------|
| [0001](0001-use-adrs.md) | Record architecture decisions with ADRs | Accepted |
| [0002](0002-modular-monolith-with-spring-modulith.md) | Modular monolith with Spring Modulith | Accepted |
| [0003](0003-react-native-for-mobile.md) | React Native for cross-platform mobile | Accepted |
| [0004](0004-java-and-spring-boot.md) | Java 25 + Spring Boot as backend platform | Superseded by [0009](0009-spring-boot-4-and-spring-cli-scaffolding.md) |
| [0005](0005-postgresql-and-event-driven-integration.md) | PostgreSQL + event-driven module integration | Proposed |
| [0006](0006-monorepo-source-control.md) | Single monorepo for backend and mobile | Accepted |
| [0007](0007-redis-cache-and-token-rotation.md) | Redis for caching and token rotation | Proposed |
| [0008](0008-expo-and-eas-toolchain.md) | Expo + EAS for the React Native toolchain | Accepted |
| [0009](0009-spring-boot-4-and-spring-cli-scaffolding.md) | Spring Boot 4 + Spring CLI scaffolding | Accepted |
| [0010](0010-social-bounded-context-and-beat-backbone.md) | Social bounded context + `BeatCaptured` backbone | Accepted |
| [0011](0011-expo-router-zustand-maestro-for-mobile.md) | Expo Router, Zustand, and Maestro for the mobile app | Accepted |
| [0012](0012-nativewind-and-react-native-reusables-for-mobile-ui.md) | NativeWind + React Native Reusables for the mobile UI component base | Accepted |

Filename pattern: `NNNN-short-kebab-title.md`. Statuses: Proposed · Accepted · Superseded · Deprecated.
