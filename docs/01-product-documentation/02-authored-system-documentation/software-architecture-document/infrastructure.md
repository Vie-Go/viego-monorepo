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
- **Media:** object storage + CDN for Cultural Beats audio/images (signed URLs).
- **Broker (future):** Kafka/RabbitMQ, introduced only when a module is
  [extracted](service-extraction-playbook.md).

```mermaid
flowchart LR
  App[Mobile App] -->|HTTPS| LB[Load Balancer]
  LB --> API[Backend container(s)]
  API --> PG[(PostgreSQL)]
  API --> CDN[(Object Storage / CDN)]
  App -->|media| CDN
```

## Environments

| Environment | Backend | Database | Mobile |
|-------------|---------|----------|--------|
| **local** | `./mvnw spring-boot:run` | Postgres via Docker Compose | Simulator → local/staging API |
| **dev** | Auto-deploy from `main` | Managed Postgres (dev) | Internal build |
| **staging** | Release candidate | Managed Postgres (staging) | Beta (TestFlight / Play beta) |
| **prod** | Tagged release | Managed Postgres (prod) | App Store / Play production |

## Configuration
- **12-factor:** config via env vars / secrets manager, never in source.
- Spring profiles: `local`, `dev`, `staging`, `prod` (`SPRING_PROFILES_ACTIVE`).
- Mobile: env-specific API base URL via build variants.
- Operating these environments: [System Admin Documentation](../../04-user-documentation/system-admin-documentation/).

> Fill in concrete hosts, regions, and providers once infrastructure is provisioned (record as
> an [ADR](decisions/)).
