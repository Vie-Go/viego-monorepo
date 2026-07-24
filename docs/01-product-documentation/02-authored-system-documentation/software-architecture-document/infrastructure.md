---
title: "Infrastructure"
description: "Deployment topology and environments for the backend and mobile app."
---

# Infrastructure

The physical/deployment view of the [container architecture](README.md#c4-level-2--containers).

## Topology
- **Backend:** one OCI container image (the whole modular monolith), built with Spring Boot
  buildpacks; runs on a container platform (Kubernetes / managed — TBD).
- **Database:** managed PostgreSQL; schema-per-module in a single database initially.
- **Cache / token store:** managed **Redis** — a non-authoritative cache for hot, slow-changing
  reads and the server-side store for refresh-token rotation ([ADR 0007](decisions/0007-redis-cache-and-token-rotation.md)).
- **Media:** **Cloudflare R2** + Cloudflare CDN for Beat photos, served via short-lived signed URLs
  ([ADR 0013](decisions/0013-object-storage-for-beat-media.md)). Accessed through the **S3 API**, so
  local development runs the same code against MinIO.
- **Broker (future):** Kafka/RabbitMQ, introduced only when a module is
  [extracted](service-extraction-playbook.md).

```mermaid
flowchart LR
  App[Mobile App] -->|HTTPS| LB[Load Balancer]
  LB --> API[Backend container(s)]
  API --> PG[(PostgreSQL)]
  API --> Redis[(Redis\ncache + token rotation)]
  API --> R2[(Cloudflare R2\nBeat photos)]
  App -->|media· signed URL| CDN[(Cloudflare CDN\nmedia.viego.app)]
  CDN --> R2
```

Redis is a cache and ephemeral-state store, **not** a source of truth: on a cache miss or a Redis
outage the backend falls back to PostgreSQL, so reads stay correct (only slower). See
[ADR 0007](decisions/0007-redis-cache-and-token-rotation.md) for the caching and token-rotation model.

## Environments

| Environment | Backend | Datastores | Media store | Mobile |
|-------------|---------|------------|-------------|--------|
| **local** | `./mvnw spring-boot:run` | Postgres + Redis via Docker Compose | **MinIO** via Docker Compose (Testcontainers in tests) | Simulator → local/staging API |
| **dev** | Auto-deploy from `main` | Managed Postgres + Redis (dev) | R2 `viego-media-dev` — 7-day object expiry | Internal build |
| **staging** | Release candidate | Managed Postgres + Redis (staging) | R2 `viego-media-staging` — 30-day object expiry | Beta (TestFlight / Play beta) |
| **prod** | Tagged release | Managed Postgres + Redis (prod) | R2 `viego-media-prod` + CDN on `media.viego.app` | App Store / Play production |

### Media store per environment

Every environment speaks the **same S3 API** — the provider is configuration, never a code
dependency — so `local` genuinely rehearses `prod` and a provider change is a config change plus a
data copy ([ADR 0013](decisions/0013-object-storage-for-beat-media.md)).

- **Cost:** local is free; dev and staging fit inside R2's free tier (10 GB, 1M Class A, 10M Class B
  per month) because their short object expiry caps stored volume; prod is projected at **~$5/mo at
  10k MAU** and **~$79/mo at 100k MAU**. Zero egress fees are what make that hold for an
  image-feed workload — the same traffic on S3 + CloudFront is ~100× the cost.
- **Isolation:** one bucket per environment with a **per-bucket API token**; the prod token exists
  only in the prod secret store.
- **Placement:** buckets carry the `apac-se` location hint to keep the primary copy near Vietnamese
  users. R2 offers no *enforced* Vietnam jurisdiction — see the residency open question in
  [ADR 0013](decisions/0013-object-storage-for-beat-media.md#open-questions), which is blocking
  before prod.
- **Lifecycle (prod):** nothing expires — Memories is permanent. Once prod storage passes ~1 TB,
  transition the `orig/` prefix to R2 Infrequent Access after 90 days; the `thumb/` and `feed/`
  derivatives stay on Standard because they serve all browsing.

## Configuration
- **12-factor:** config via env vars / secrets manager, never in source.
- Spring profiles: `local`, `dev`, `staging`, `prod` (`SPRING_PROFILES_ACTIVE`).
- Media store: `VIEGO_MEDIA_ENDPOINT`, `VIEGO_MEDIA_BUCKET`, `VIEGO_MEDIA_ACCESS_KEY`,
  `VIEGO_MEDIA_SECRET_KEY`, `VIEGO_MEDIA_PUBLIC_HOST` — MinIO locally, R2 elsewhere, same S3 client.
- Mobile: env-specific API base URL via build variants.
- Operating these environments: [System Admin Documentation](../../04-user-documentation/system-admin-documentation/).

> The media store is decided ([ADR 0013](decisions/0013-object-storage-for-beat-media.md)). Fill in
> the remaining concrete hosts, regions, and providers once infrastructure is provisioned (record as
> an [ADR](decisions/)).
