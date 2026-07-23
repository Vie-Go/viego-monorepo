# AGENTS.md — Operating Guide for AI Agents

How AI agents should read and contribute to this knowledge base. **Read this first.**

## Prime directives

1. **Specs are the source of truth.** Behaviour is decided in
   [`docs/01-product-documentation/01-core-specifications/`](docs/01-product-documentation/01-core-specifications/)
   — the OpenAPI/AsyncAPI contracts and the BDD/Gherkin features — not inferred from code. If
   code and spec disagree, the spec wins; flag the drift.
2. **Respect the ubiquitous language.** Use the exact terms in the
   [DDD & Domain Model](docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/ddd-and-domain-model.md).
   Never invent a synonym for an existing domain term.
3. **Obey the architecture principles.** Every design must satisfy the
   [principles](docs/01-product-documentation/02-authored-system-documentation/software-architecture-document/architecture-principles.md).
4. **Keep module boundaries intact.** Backend changes follow the
   [Module Boundary Rules](docs/02-process-documentation/sdd-standards/module-boundary-rules.md);
   `ApplicationModules.verify()` must stay green.

## How to navigate

The map is [`docs/index.md`](docs/index.md). Two top-level areas:

- **[1.1 Product Documentation](docs/01-product-documentation/)** — what the system is:
  core specs (source of truth) · architecture (SAD: C4, DDD, Spring Modulith, ADRs) · generated
  artifacts · user/admin docs.
- **[1.2 Process Documentation](docs/02-process-documentation/)** — how the team works:
  roadmap/backlog · SDD standards · test strategy · release checklist · reports.

## Conventions when writing docs

- Every page has `title` + `description` frontmatter (see
  [Documentation Conventions](docs/02-process-documentation/sdd-standards/documentation-conventions.md)).
- One concept per file; each folder has a `README.md` index.
- Change behaviour by editing the **Core Specifications first**, then implement.
- Add new domain terms to the glossary (in the DDD doc) in the **same change**.
- ADRs are immutable — supersede, never edit.

## The SDD workflow

```
Core Specs (OpenAPI/AsyncAPI + Gherkin)  →  generate artifacts  →  implement  →  verify (contract/BDD + module boundaries)  →  release
        ▲                                                                                   │
        └───────────── ubiquitous language + architecture principles ───────────────────────┘
```

When asked to "build feature X": find/author its executable spec + API contract in Core
Specifications, confirm the owning bounded context/module, then implement to satisfy the spec.

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan at [specs/003-modular-database-schemas/plan.md](specs/003-modular-database-schemas/plan.md).
<!-- SPECKIT END -->
