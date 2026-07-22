---
title: "SDD Standards"
description: "The standards that keep specs, APIs, modules, and docs consistent."
---

# SDD Standards

The rules that keep Spec-Driven Development consistent across the team.

| Standard | Covers |
|----------|--------|
| [API Design Guidelines](api-design-guidelines.md) | REST/OpenAPI & event/AsyncAPI conventions, versioning, errors |
| [Module Boundary Rules](module-boundary-rules.md) | Spring Modulith boundaries, naming, allowed dependencies |
| [Documentation Conventions](documentation-conventions.md) | How docs in this repo are written and organized |

## The SDD workflow
```
1. Author/agree the spec        → Core Specifications (OpenAPI/AsyncAPI + Gherkin)
2. Generate artifacts            → clients, API reference, boundary/contract tests
3. Implement to satisfy the spec → code + module tests
4. Verify                        → contract/BDD tests, ApplicationModules.verify()
5. Release                       → Release Checklist
```
The [ubiquitous language](../../01-product-documentation/02-authored-system-documentation/software-architecture-document/ddd-and-domain-model.md)
is the naming authority for all of the above.
