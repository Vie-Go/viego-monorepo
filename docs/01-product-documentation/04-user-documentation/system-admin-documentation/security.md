---
title: "Security"
description: "Authentication, secrets, and data protection."
---

# Security

## Authentication & authorization
- External identity via **OIDC/OAuth2**: Google, Facebook, Zalo, plus email
  ([Identity context](../../02-authored-system-documentation/software-architecture-document/ddd-and-domain-model.md)).
- Backend issues short-lived **JWT** access tokens + refresh tokens; Spring Security enforces auth
  on all non-public endpoints.
- **Refresh-token rotation** with reuse detection and a revoked-token denylist are held in **Redis**
  ([ADR 0007](../../02-authored-system-documentation/software-architecture-document/decisions/0007-redis-cache-and-token-rotation.md));
  a replayed refresh token revokes the whole rotation family. Access JWTs stay self-validating, so
  Redis is consulted only for rotation/revocation.
- Authorization: an Explorer can only access **their own** resources (`me` scoping).

## Secrets & config
- **No secrets in source or images.** Use a secrets manager / env injection.
- Rotate provider client secrets and signing keys; separate secrets per environment.

## Data protection
- TLS everywhere (HTTPS, DB in transit).
- Minimize PII; encrypt sensitive data at rest; no PII in logs/URLs.
- Media served via signed/CDN URLs; access respects unlock entitlement. Media buckets are **private**
  with a **per-environment API token**; upload uses short-lived presigned `PUT`, delivery uses an
  edge-validated token ([ADR 0013](../../02-authored-system-documentation/software-architecture-document/decisions/0013-object-storage-for-beat-media.md)).
- **Data residency:** Beat photos sit outside Vietnam on Cloudflare R2 (`apac-se` hint, no enforced
  jurisdiction) — an open compliance question under Decree 53/2022, blocking before prod.

## Application hardening
- Input validation at the API boundary; RFC 9457 errors without leaking internals.
- Dependency & container scanning in [CI](ci-cd.md).
- Rate limiting on auth and unlock endpoints.

## Prohibited in code review
- Committing credentials/tokens · bypassing auth · logging personal or credential data.

> Formalize the token design and provider integration in a spec/ADR before implementation.
