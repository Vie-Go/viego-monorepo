---
title: "1.1.1 Core Specifications (The Source of Truth)"
description: "API/system specifications and executable BDD specifications — the authoritative contracts."
---

# 1.1.1 Core Specifications — The Source of Truth

These specifications are **authoritative**. Code, tests, and generated docs derive from them; if
code and spec disagree, the spec wins. This is the heart of Spec-Driven Development.

## Contents

| Sub-section | What it holds |
|-------------|---------------|
| [API / System Specifications](api-system-specifications/) | The interface contracts: REST (OpenAPI), async domain events (AsyncAPI), and canonical data schemas. Replaces traditional PRDs/tech-designs for system interfaces. |
| [Executable Specifications](executable-specifications/) | Business logic as BDD/Gherkin `.feature` files — human-readable and machine-executable. |

## Rules
- Change behaviour **here first**, then implement.
- Every endpoint/event/scenario is owned by exactly one [bounded context](../02-authored-system-documentation/software-architecture-document/ddd-and-domain-model.md).
- Breaking API changes are versioned; released mobile clients must keep working.
