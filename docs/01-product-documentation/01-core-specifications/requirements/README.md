---
title: "Requirements (FRD & NFRD)"
description: "The numbered, traceable functional and non-functional requirements VieGo must satisfy."
---

# Requirements

The **traceable requirement register** for VieGo. These give every capability and quality attribute a
stable ID so specs, designs, tests, and tickets can trace to it.

| Document | What it holds |
|----------|---------------|
| [Functional Requirements (FRD)](functional-requirements.md) | *What* the system does — `FR-<CTX>-NN`, grouped by [bounded context](../../02-authored-system-documentation/software-architecture-document/ddd-and-domain-model.md). |
| [Non-Functional Requirements (NFRD)](non-functional-requirements.md) | *How well* it must do it — `NFR-<CAT>-NN`: performance, security, accessibility, localization, reliability, modularity. |

## Where this sits

Requirements are the **scope layer** of the [source of truth](../README.md): the FRD names each
capability, and the [executable](../executable-specifications/) and [API](../api-system-specifications/)
specs pin its exact behaviour. Requirements say *whether* something is in scope; specs say *exactly how it
behaves*. When they disagree, the **spec wins** — change the requirement here first, then the spec.

## Conventions

- Reference requirements by ID (`FR-EX-02`, `NFR-SEC-01`) in designs, feature files, commits, and issues.
- `draft` requirements are blocked on a product [open decision](functional-requirements.md#open-decisions).
- NFRs **constrain** functional requirements rather than adding features.
