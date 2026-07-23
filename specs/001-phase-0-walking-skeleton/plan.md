# Implementation Plan: Phase 0 — Walking Skeleton

**Branch**: `001-phase-0-walking-skeleton` | **Date**: 2026-07-22 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-phase-0-walking-skeleton/spec.md`

## Summary

Stand up the VieGo delivery foundation: a monorepo with a **Spring Boot (Java 25) modular-monolith
backend** and a **React Native mobile app**, wired so a trivial vertical slice (app → dev backend
health/ping) runs in the **dev** environment, **path-scoped CI** is green on both sides, and
**`ApplicationModules.verify()`** enforces module boundaries from the first commit. No product
feature ships; the deliverable is a proven platform every later phase (P1–P6) builds on.

Technical approach (from [research.md](research.md)): **Expo + EAS** for the mobile toolchain
(resolves the spec's open decision), Spring Modulith with six empty modules, springdoc for
auto-generated API docs, Flyway wired with zero migrations, Docker Compose Postgres for local, and
GitHub Actions with `paths:` filters for path-scoped pipelines.

## Technical Context

**Language/Version**: Backend **Java 25** (**Spring Boot 4**, scaffolded via the **Spring CLI** —
[ADR-0009](../../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/decisions/0009-spring-boot-4-and-spring-cli-scaffolding.md)); Mobile **TypeScript** on **React Native** via **Expo SDK** (latest stable).

**Primary Dependencies**: Backend — Spring Boot 4, **Spring Modulith**, springdoc-openapi, Flyway,
Spring Actuator. Mobile — Expo, **EAS Build**, **Expo Router**, **Zustand** (client state),
**TanStack Query** (server state), an i18n library (react-i18next or equivalent) — per
[ADR-0011](../../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/decisions/0011-expo-router-zustand-maestro-for-mobile.md),
superseding the React Navigation reference in earlier drafts of this plan.

**Storage**: **PostgreSQL** (schema-per-module; single DB in dev). Local Postgres via **Docker
Compose**. Redis is **out of scope** for Phase 0 ([ADR 0007](../../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/decisions/0007-redis-cache-and-token-rotation.md) — introduced with its first consumer in P1/P2).

**Testing**: Backend — JUnit 5, **`@ApplicationModuleTest`**, `ApplicationModules.verify()`,
Testcontainers (Postgres). Mobile — Jest + React Native Testing Library; **Maestro** E2E
([ADR-0011](../../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/decisions/0011-expo-router-zustand-maestro-for-mobile.md) —
supersedes the earlier "Detox/Maestro deferred past P0" note; Maestro is in scope, Detox is not
used).

**Target Platform**: Backend — Linux container on a managed container platform (dev). Mobile —
iOS 15+ / Android (via Expo/EAS).

**Project Type**: **Mobile + API**, single monorepo ([ADR-0006](../../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/decisions/0006-monorepo-source-control.md)).

**Performance Goals**: None product-level (skeleton). Onboarding target: fresh checkout → both apps
running locally in **≤30 min** (SC-001). Dev backend health endpoint returns healthy on deploy.

**Constraints**: `ApplicationModules.verify()` stays green; CI **path-scoped** (backend-only change
never runs mobile pipeline and vice-versa; `contracts/**` triggers both); no secrets in source; API
versioned under `/api/v1` from the start.

**Scale/Scope**: 2 full-stack engineers; 6 empty modules (`identity`, `exploration`, `content`,
`engagement`, `social`, `shared`); 1 trivial documented endpoint + Actuator health; app shell = auth
stack + 4 tab placeholders, VI/EN i18n, light/dark theme, API client skeleton.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verified against the VieGo Documentation Constitution v1.0.0 (`.specify/memory/constitution.md`):

- [x] **I. Specs are source of truth** — Phase 0 invents **no product behaviour**; the only endpoint
  (health/ping + a trivial status) is infrastructure, and its interface contract is placed under
  `contracts/` establishing the contract-first seam. No behaviour is inferred from code. **PASS.**
- [x] **II. Ubiquitous language** — uses the exact module/domain terms (`identity`, `exploration`,
  `content`, `engagement`, `social`, `shared`, Explorer); introduces **no new domain terms**, so no
  glossary change is required. **PASS.**
- [x] **III. Architecture & module boundaries** — the phase's core purpose is to wire
  `ApplicationModules.verify()` and the five-module layout per the [Module Boundary Rules](../../docs/02-process-documentation/sdd-standards/module-boundary-rules.md); no boundary is crossed. **PASS.**
- [x] **IV. Documentation conventions** — SDD working artifacts live under `specs/` (not the docmd
  knowledge base), so frontmatter/taxonomy rules do not apply to them. The one knowledge-base change
  this plan proposes (recording the Expo decision) is an **ADR** placed in the correct taxonomy with
  frontmatter. **PASS.**
- [x] **V. Immutable decisions & spec-first flow** — the mobile-toolchain decision is recorded as a
  **new ADR (0008)** that references [ADR-0003](../../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/decisions/0003-react-native-for-mobile.md)
  rather than editing it. Spec was authored before this plan. **PASS.**

No violations → **Complexity Tracking is empty**.

## Project Structure

### Documentation (this feature)

```text
specs/001-phase-0-walking-skeleton/
├── plan.md              # This file
├── research.md          # Phase 0 output — decisions incl. mobile toolchain
├── data-model.md        # Phase 1 output — module skeletons + health resource
├── quickstart.md        # Phase 1 output — run the walking skeleton
├── contracts/           # Phase 1 output — platform.openapi.yaml (health + trivial status)
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

Monorepo, **Mobile + API** layout. Path prefixes match the CI path-filters ([CI/CD](../../docs/01-product-documentation/04-user-documentation/system-admin-documentation/ci-cd.md)).

```text
backend/                         # Spring Boot (Java 25) modular monolith — path: backend/**
├── src/main/java/com/viego/
│   ├── VieGoApplication.java
│   ├── identity/                # @ApplicationModule — empty skeleton
│   │   ├── package-info.java    #   api/ (named interface) · domain/ · application/ · infrastructure/
│   │   └── api/
│   ├── exploration/             # @ApplicationModule — empty skeleton
│   ├── engagement/              # @ApplicationModule — empty skeleton
│   ├── content/                 # @ApplicationModule — empty skeleton
│   ├── shared/                  # thin shared kernel (ids, LocalizedText) — no business logic
│   └── platform/                # trivial status endpoint (health/ping wiring, non-domain)
├── src/main/resources/
│   ├── application.yml
│   └── db/migration/{identity,exploration,content,engagement,social}/   # Flyway paths, no migrations yet
├── src/test/java/com/viego/
│   └── ModulithVerificationTest.java   # ApplicationModules.verify()
├── compose.yaml                 # local Postgres
├── pom.xml
└── Dockerfile / buildpacks config

mobile/                          # React Native + Expo (TypeScript) — path: mobile/**
├── app/ (or src/)
│   ├── navigation/              # AuthStack + Tab placeholders (Map/Collection/Streak/Profile)
│   ├── shared/
│   │   ├── ui/                  # Button, Card, Input primitives
│   │   ├── theme/               # design tokens from DESIGN.md; light/dark
│   │   ├── i18n/                # vi/en scaffold + switch
│   │   └── api/                 # API client skeleton + health/ping call
│   └── App.tsx
├── __tests__/                   # Jest + RN Testing Library
├── app.json / eas.json          # Expo + EAS config
└── package.json

contracts/                       # Shared OpenAPI/AsyncAPI — path: contracts/** (triggers BOTH pipelines)
└── platform.openapi.yaml        # health/ping + trivial status (v1)

.github/workflows/               # path-scoped pipelines
├── backend.yml                  # build → verify() → test → scan → image → deploy dev
└── mobile.yml                   # typecheck → lint → test → build
```

**Structure Decision**: **Mobile + API monorepo**. `backend/`, `mobile/`, and `contracts/` are the
three top-level path scopes the CI filters key off; `contracts/**` is the deliberate shared trigger.
The backend package layout (`api`/`domain`/`application`/`infrastructure` per module, `shared` kernel)
follows the [Backend Modular Monolith](../../docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/backend-modular-monolith.md)
design so later phases fill skeletons without restructuring.

## Complexity Tracking

> No constitution violations — section intentionally empty.
