<!--
SYNC IMPACT REPORT
==================
Version change: TEMPLATE (unversioned) → 1.0.0
Bump rationale: Initial ratification. Concrete principles replace all template
  placeholders; establishes the first governed baseline (MINOR-equivalent → 1.0.0).

Principles defined (all new):
  I.   Specifications Are the Source of Truth (NON-NEGOTIABLE)
  II.  Ubiquitous Language Discipline
  III. Architecture Principles & Module Boundaries
  IV.  Documentation Structure & Conventions
  V.   Immutable Decisions & Spec-First Change Flow

Sections defined:
  - Technology & Delivery Constraints (was [SECTION_2_NAME])
  - Development Workflow (was [SECTION_3_NAME])
  - Governance

Templates & artifacts reviewed:
  ✅ .specify/templates/plan-template.md — Constitution Check gate populated with
     concrete per-principle gates.
  ✅ .specify/templates/spec-template.md — no constitution references; no mandatory
     sections added/removed; no change needed.
  ✅ .specify/templates/tasks-template.md — no constitution references; principle-driven
     task categories already representable; no change needed.
  ✅ AGENTS.md — runtime guidance; prime directives already consistent with these
     principles (this constitution codifies them).

Follow-up TODOs: none. RATIFICATION_DATE set to initial adoption date (2026-07-22).
-->

# VieGo Documentation Constitution
<!-- Knowledge base for VieGo — governed by Spec-Driven Development. -->

## Core Principles

### I. Specifications Are the Source of Truth (NON-NEGOTIABLE)

Behaviour is decided in the Core Specifications
(`docs/01-product-documentation/01-core-specifications/`) — the OpenAPI/AsyncAPI
contracts and the BDD/Gherkin features — and nowhere else. Documentation, generated
artifacts, and code MUST conform to those specs. When code and spec disagree, the spec
wins and the drift MUST be flagged in the same change. Behaviour MUST NOT be inferred
from implementation.

**Rationale:** A single authoritative source prevents divergence between what the system
promises and what it does, and lets both developers and AI agents reason from one
contract rather than reverse-engineering intent from code.

### II. Ubiquitous Language Discipline

All docs, specs, and designs MUST use the exact terms defined in the DDD & Domain Model
(`.../software-architecture-document/ddd-and-domain-model.md`). Inventing a synonym for an
existing domain term is prohibited. Any new domain term MUST be added to the glossary in
the DDD document within the same change that introduces it.

**Rationale:** One consistent vocabulary across product, engineering, and AI agents removes
ambiguity, and keeping the glossary current in-change prevents undefined terminology from
leaking into the knowledge base.

### III. Architecture Principles & Module Boundaries

Every design MUST satisfy the documented architecture principles
(`.../software-architecture-document/architecture-principles.md`). Backend changes MUST
respect the Module Boundary Rules
(`docs/02-process-documentation/sdd-standards/module-boundary-rules.md`), and
`ApplicationModules.verify()` MUST stay green. A change that requires crossing a module
boundary MUST first update the boundary rules and justify the change.

**Rationale:** Explicit boundaries keep the Spring Modulith modular monolith decomposable
and independently testable; an automated verify gate makes boundary erosion a build
failure rather than a slow architectural decay.

### IV. Documentation Structure & Conventions

Every documentation page MUST carry `title` + `description` frontmatter per the
Documentation Conventions
(`docs/02-process-documentation/sdd-standards/documentation-conventions.md`). Content MUST
follow one-concept-per-file, and every folder MUST provide a `README.md` index. New pages
MUST be placed within the standard Product / Process taxonomy under `docs/`; ad-hoc
locations are prohibited.

**Rationale:** A predictable structure and complete frontmatter make the knowledge base
navigable for humans, the docmd static site generator, and AI agents alike, and keep the
site index and search coherent.

### V. Immutable Decisions & Spec-First Change Flow

To change behaviour, the Core Specifications MUST be edited first, then artifacts generated
and implementation updated to satisfy the spec — never the reverse. Architecture Decision
Records (ADRs) are immutable: a superseded decision MUST be replaced by a new ADR that
references it, and existing ADRs MUST NOT be edited to change their outcome.

**Rationale:** Spec-first change keeps the source of truth authoritative rather than
retrofitted, and immutable ADRs preserve an auditable decision history that explains not
just the current design but why prior choices were abandoned.

## Technology & Delivery Constraints

The documented system targets a **Spring Boot (Java 25) modular monolith** with **Spring
Modulith**, a **React Native (iOS/Android)** client, and **PostgreSQL**. Documentation and
design decisions MUST remain consistent with this stack; proposing a different stack
requires an ADR under Principle V.

The knowledge base itself is authored in Markdown and built with **docmd** (`npm run dev`
for preview, `npm run build` into `./site`) and deployed via **Vercel**. Build output
(`./site`) is generated and MUST NOT be hand-edited or committed as a source of truth.
Accessibility commitments in `PRODUCT.md` (contrast, multi-language priority for Vietnamese
& English, ≥44px touch targets) constrain UX documentation.

## Development Workflow

Work follows the SDD workflow:

```
Core Specs (OpenAPI/AsyncAPI + Gherkin) → generate artifacts → implement
    → verify (contract/BDD + module boundaries) → release
        ▲                                                    │
        └──── ubiquitous language + architecture principles ─┘
```

For any "build feature X" request, the owner MUST (1) find or author the executable spec +
API contract in Core Specifications, (2) confirm the owning bounded context/module, then
(3) implement to satisfy the spec. Changes MUST pass contract/BDD verification and module
boundary verification before release, per the test strategy and release checklist in
`docs/02-process-documentation/`.

## Governance

This constitution supersedes other documentation and process practices. When a practice
conflicts with a principle here, this document wins.

**Amendments** MUST be proposed as an explicit change to this file, documented in the Sync
Impact Report, reviewed, and approved before merge. Amendments MUST include propagation
updates to any dependent templates and guidance affected by the change.

**Versioning** follows semantic versioning of governance:
- **MAJOR** — backward-incompatible removal or redefinition of a principle or governance rule.
- **MINOR** — a new principle/section is added, or existing guidance is materially expanded.
- **PATCH** — clarifications, wording, or non-semantic refinements.

**Compliance** MUST be verified in reviews: every plan, spec, and PR is checked against
these principles, and any deviation MUST be justified in the plan's Complexity Tracking (or
rejected). Use `AGENTS.md` and the SDD standards under
`docs/02-process-documentation/sdd-standards/` for runtime development guidance.

**Version**: 1.0.0 | **Ratified**: 2026-07-22 | **Last Amended**: 2026-07-22
