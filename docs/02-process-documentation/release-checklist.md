---
title: "Release Checklist"
description: "Pre-release verification for backend and mobile."
---

# Release Checklist

Run before every release. Detailed procedures: [Deployment](../01-product-documentation/04-user-documentation/system-admin-documentation/deployment.md).

## Backend
- [ ] All CI gates green (unit, module, contract, BDD, boundary verification).
- [ ] `ApplicationModules.verify()` passes.
- [ ] OpenAPI/AsyncAPI changes reviewed; version bumped if breaking.
- [ ] Flyway migrations are backward-compatible (expand/contract for breaking changes).
- [ ] No high/critical vulnerabilities (dependency + container scan).
- [ ] Config/secrets present for the target environment; no secrets in the image.
- [ ] Observability in place (health, dashboards, alerts) for new surfaces.
- [ ] Rollback plan confirmed (previous image tag; migration-safe).

## Mobile
- [ ] Unit/component/E2E suites green.
- [ ] API compatibility confirmed against the deployed backend (`/api/v1`).
- [ ] VI + EN parity checked; light + dark verified on key screens.
- [ ] Accessibility spot-check (touch targets ≥44px, contrast).
- [ ] Store metadata, screenshots, and privacy disclosures updated.
- [ ] Minimum supported app version reviewed.

## Sign-off
- [ ] Release notes written.
- [ ] Product + Eng sign-off.
