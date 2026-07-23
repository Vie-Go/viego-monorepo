# VieGo — Project Documentation

Knowledge base for **VieGo**: a social capture app for Vietnam — snap a photo (a **Beat**) that
auto-tags where you are, keeps your daily streak alive, unlocks the province, and lands on your
friends' maps and feeds. Province by province, one Beat at a time. It serves both developers and AI
agents.

**Stack:** Spring Boot (Java 25) modular monolith · React Native (iOS/Android) · PostgreSQL.
**Method:** Spec-Driven Development (SDD) with a Domain-Driven Design (DDD) model.

## Monorepo layout

This repository is the VieGo **monorepo** — application code plus its knowledge base
([ADR-0006](docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/decisions/0006-monorepo-source-control.md)):

```
backend/     # Spring Boot 4 (Java 25) modular monolith — Spring Modulith. See backend/ + ADR-0009.
mobile/      # React Native + Expo (TypeScript) app.
contracts/   # Shared OpenAPI/AsyncAPI — a change here triggers BOTH CI pipelines.
docs/        # Knowledge base (docmd site) — specs, architecture, process.
specs/       # Spec-Driven Development working artifacts (spec/plan/tasks per feature).
.github/     # Path-scoped CI workflows (backend.yml, mobile.yml).
```

### Run the apps (Phase 0 walking skeleton)

```bash
# Backend (needs Docker for local Postgres)
cd backend && docker compose up -d && ./mvnw spring-boot:run   # → http://localhost:8080/api/v1/status
cd backend && ./mvnw test                                       # module-boundary verify() + web tests

# Mobile (Expo)
cd mobile && npm install && npm run start                       # open on simulator / device
cd mobile && npx tsc --noEmit                                   # typecheck (mobile CI gate)
```

Full walkthrough: [`specs/001-phase-0-walking-skeleton/quickstart.md`](specs/001-phase-0-walking-skeleton/quickstart.md).

## Documentation structure

Docs follow a standard Product / Process taxonomy under [`docs/`](docs/):

```
docs/
├── 01-product-documentation/          # WHAT VieGo is & how it behaves
│   ├── 01-core-specifications/        # Source of truth: OpenAPI, AsyncAPI, BDD/Gherkin
│   ├── 02-authored-system-documentation/
│   │   ├── software-architecture-document/   # C4, DDD, Spring Modulith, ADRs, infra
│   │   └── ui-ux-design-document/            # design system, screens, components, localization
│   ├── 03-generated-system-artifacts/ # API reference, code models, QA reports (generated)
│   └── 04-user-documentation/         # end-user, developer integration, system admin
└── 02-process-documentation/          # HOW the team works
    ├── roadmaps-and-backlogs.md
    ├── sdd-standards/                 # API guidelines, module boundary rules, doc conventions
    ├── plans-estimates-schedules.md
    ├── test-strategy.md
    ├── release-checklist.md
    └── reports.md
```

Start at [`docs/index.md`](docs/index.md).

## The docs site (docmd)

```bash
npm install
npm run dev      # local preview
npm run build    # build static site into ./site
```

## Related repo files
- [`PRODUCT.md`](PRODUCT.md) — product vision.
- [`DESIGN.md`](DESIGN.md) — design system (source for the UX docs).
- [`AGENTS.md`](AGENTS.md) — how AI agents should use this knowledge base.
- [`prototype/`](prototype/) — reference web prototype + canonical datasets.
