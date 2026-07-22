---
title: "Documentation Conventions"
description: "How docs in this repo are written, named, and organized."
---

# Documentation Conventions

## Structure
- Follow the [Product / Process taxonomy](../../index.md). Put a doc where its **audience and
  purpose** fit, not where it's convenient.
- Each folder has a `README.md` that indexes its contents.
- Numeric folder prefixes (`01-`, `02-`) fix ordering.

## Frontmatter (every page)
```yaml
---
title: "Human title"
description: "One-line summary (used by search/SEO and the sidebar)."
---
```

## Writing
- One concept per file; short and focused. Prefer tables and short lists over walls of prose.
- Use the [ubiquitous language](../../01-product-documentation/02-authored-system-documentation/software-architecture-document/ddd-and-domain-model.md);
  add new domain terms to the glossary in the **same change**.
- Link related docs with relative Markdown links.
- Diagrams: Mermaid fenced code blocks (rendered by the docs site).

## Source-of-truth discipline
- Behavioural truth lives in [Core Specifications](../../01-product-documentation/01-core-specifications/);
  architecture rationale in [ADRs](../../01-product-documentation/02-authored-system-documentation/software-architecture-document/decisions/).
- Don't duplicate spec content into prose docs — link to it.
- ADRs are immutable — supersede, never edit.

## Site
Rendered with **docmd** (`npm run dev` / `npm run build`); navigation is defined in
[`docmd.config.json`](../../../docmd.config.json).
