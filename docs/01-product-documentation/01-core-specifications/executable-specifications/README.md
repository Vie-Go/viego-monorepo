---
title: "Executable Specifications (BDD)"
description: "Business logic as Gherkin feature files — human-readable and machine-executable."
---

# Executable Specifications (BDD)

Business rules expressed as **Gherkin** `.feature` files: readable by product & stakeholders,
executable by the backend (Cucumber/JVM) and app (Cucumber/Detox) test suites. These are the
behavioural half of the source of truth (the [API specs](../api-system-specifications/) are the
interface half).

## Organization
One folder per [bounded context](../../02-authored-system-documentation/software-architecture-document/ddd-and-domain-model.md);
scenarios use the [ubiquitous language](../../../../02-process-documentation/sdd-standards/README.md).

```
features/
├── identity/       authentication.feature
├── exploration/    province-unlocking.feature
├── engagement/     daily-streak.feature
└── content/        heritage-access.feature
```

## Authoring rules
- `Given/When/Then`, one behaviour per scenario, business language (no UI/DB detail).
- Every scenario traces to a [functional requirement](../requirements/functional-requirements.md)
  (`FR-*`) and, where relevant, to an [API operation](../api-system-specifications/); these features
  pin the exact behaviour of the requirements they realise.
- Tag with context and status: `@exploration @draft`.
- Keep VI/EN, theme, and accessibility acceptance as scenarios or checklist tags where testable.

## Status
These are **seed** specifications. `@draft` scenarios (e.g. the unlock condition) need product
decisions before they become `@ready`.
