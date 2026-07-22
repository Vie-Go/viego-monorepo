# VieGo — Project Documentation

Knowledge base for **VieGo**: a gamified app for discovering, unlocking, and
collecting Vietnam's regional cultural heritage — province by province. It serves both
developers and AI agents.

**Stack:** Spring Boot (Java 25) modular monolith · React Native (iOS/Android) · PostgreSQL.
**Method:** Spec-Driven Development (SDD) with a Domain-Driven Design (DDD) model.

## Structure

Docs follow a standard Product / Process taxonomy under [`docs/`](docs/):

```
docs/
├── 01-product-documentation/          # WHAT VieGo is & how it behaves
│   ├── 01-core-specifications/        # Source of truth: OpenAPI, AsyncAPI, BDD/Gherkin
│   ├── 02-authored-system-documentation/
│   │   ├── software-architecture-document/   # C4, DDD, Spring Modulith, ADRs, infra
│   │   └── ux-design-documentation/          # design system, localization
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
