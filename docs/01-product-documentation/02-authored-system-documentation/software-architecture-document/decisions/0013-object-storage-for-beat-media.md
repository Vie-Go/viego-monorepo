---
title: "ADR 0013 — Cloudflare R2 for Beat media, MinIO locally"
description: "S3-compatible object storage for Beat photos: MinIO locally, Cloudflare R2 for dev/staging/prod, chosen on egress cost; client-side derivatives instead of a transformation service."
---

# ADR 0013 — Cloudflare R2 for Beat media, MinIO locally

- **Status:** Proposed · **Date:** 2026-07-24 · **Deciders:** VieGo team

## Context
[Beats are photo check-ins](../design/content.md) — media is the product, not an accessory. The
architecture already fixes the *shape* of the solution ([infrastructure](../infrastructure.md)):
media lives in **object storage + CDN**, the DB holds only `photo_ref`
([data-schemas](../../../01-core-specifications/api-system-specifications/data-schemas.md#beat)),
and photos are delivered via **short-lived signed/CDN URLs, never proxied through the app server**
([FR-CO-05](../../../01-core-specifications/requirements/functional-requirements.md#fr-co--content-beats-reviews--memories),
[NFR-PERF-03](../../../01-core-specifications/requirements/non-functional-requirements.md#nfr-perf--performance)).
What was left `TBD` is the **provider per environment**.

The cost profile of this workload is unusual and decides the answer:

- **Storage grows monotonically.** Beats are immutable and Memories never expires them, so stored
  bytes only accumulate.
- **Egress dominates everything else.** A social feed re-reads the same photos constantly — the
  Discover and friends feeds, the Collection map, and the Memories calendar are all image walls.
  Egress volume is roughly *two orders of magnitude* larger than the bytes ingested.
- **Operations are cheap if the edge caches.** Beats are immutable, so a photo is infinitely
  cacheable and origin reads collapse to roughly the cache-miss rate.

That means **egress price per GB — not storage price per GB — is the dominant term**, and any
provider that meters egress is disqualified on cost alone before latency or ergonomics are
considered.

## Decision (proposed)

### 1. Provider per environment

| Environment | Store | Rationale | Expected cost |
|-------------|-------|-----------|---------------|
| **local** | **MinIO** in [Docker Compose](../../../../../backend/compose.yaml), Testcontainers for integration tests | Same S3 API as prod, zero network dependency, works offline; no cloud credentials on a laptop | **$0** |
| **dev** | Cloudflare **R2** bucket `viego-media-dev` (7-day object expiry) | Same API surface as prod so nothing drifts; short expiry keeps it inside the free tier | **~$0** (free tier) |
| **staging** | Cloudflare **R2** bucket `viego-media-staging` (30-day object expiry) | Release-candidate parity with prod, including the CDN + signed-URL path | **~$0–1/mo** |
| **prod** | Cloudflare **R2** bucket `viego-media-prod` + Cloudflare CDN on `media.viego.app` | Zero egress fees; CDN and storage are one product and one bill | **~$5/mo at launch scale** (see below) |

All four are driven through the **AWS S3 SDK** against a configurable endpoint. The provider is a
config value (`VIEGO_MEDIA_ENDPOINT`, `…_BUCKET`, `…_ACCESS_KEY`, `…_SECRET_KEY`), never a code
dependency — the same 12-factor rule as every other backing service.

> MinIO no longer publishes pre-built community binaries, so pin the Docker image to a known-good
> tag rather than tracking `latest`. Its AGPLv3 licence is unproblematic here because MinIO runs
> **only** on developer machines and in CI — it is never distributed and never serves users.

### 2. No transformation service — derivatives are produced on the client

Each capture uploads **three WebP objects** under one `photo_ref` prefix, generated on-device with
`expo-image-manipulator` before upload:

| Variant | Long edge | Typical size | Serves |
|---------|-----------|--------------|--------|
| `thumb/` | 240 px | ~15 KB | Memories calendar, map pins |
| `feed/` | 720 px | ~70 KB | Discover and friends feeds |
| `orig/` | 1600 px | ~350 KB | Beat detail modal, export |

This replaces an on-the-fly transformation service (Cloudflare Images at $0.50 per 1,000 unique
transformations). Because a "unique transformation" is billed per image × variant × month and every
Beat is *new* media, transformations would scale linearly with captures — **~$130/mo at 10k MAU**
versus **~$0** for three client-side resizes. It also shrinks the upload: the client sends ~435 KB
instead of a 4 MB camera original, which directly serves the optimistic "Beat sent!" path
([NFR-PERF-04](../../../01-core-specifications/requirements/non-functional-requirements.md#nfr-perf--performance)).

### 3. Upload and delivery paths

- **Upload:** the backend issues a **presigned S3 `PUT`** (5-minute TTL, content-length and
  content-type bound) per variant; the client uploads **directly to R2**. Media never transits the
  app server in either direction.
- **Delivery:** the backend evaluates the Beat's **audience against PostgreSQL** — never against a
  cache ([design/content.md](../design/content.md#persistence)) — and then returns a URL on the
  `media.viego.app` custom domain carrying a **short-lived HMAC token** (15-minute TTL) validated at
  the edge. The cache key **excludes** the token so all viewers of a Beat share one cached object.
- **Why not presigned S3 `GET` for delivery:** presigned URLs on the S3 endpoint bypass the CDN, so
  every view becomes an origin read and loses edge caching. Presigned `GET` stays available for
  server-to-server and export use, not for the feed.

### 4. Lifecycle

- Prod: expire nothing (Memories is permanent); transition **`orig/` only** to R2 **Infrequent
  Access** after 90 days once prod storage passes ~1 TB. Derivatives stay on Standard because they
  serve all browsing; `orig/` is read only on detail-open and export, so IA's $0.01/GB retrieval fee
  applies to a small fraction of reads.
- dev/staging: object expiry (7 / 30 days) so non-prod storage cannot creep.
- Buckets carry the `apac-se` **location hint** to keep the primary copy near Vietnamese users.
- Per-bucket API tokens; the prod token exists only in the prod secret store
  ([NFR-SEC-03](../../../01-core-specifications/requirements/non-functional-requirements.md#nfr-sec--security--privacy)).

### 5. Cost model

Assumptions: ~435 KB and 3 PUTs per Beat; 3 Beats/Explorer/week; ~90% edge cache hit ratio;
storage figures are the year's *average* stored volume, not the end state.

| Scale | Beats/mo | Stored (avg) | **R2** | AWS S3 + CloudFront |
|-------|----------|--------------|--------|---------------------|
| Closed beta (500 Explorers) | ~4.3k | ~11 GB | **~$0** (free tier) | ~$25/mo |
| Launch (10k MAU) | ~130k | ~340 GB | **~$5/mo** | ~$520/mo |
| Growth (100k MAU) | ~1.3M | ~3.4 TB | **~$79/mo** | ~$5,000/mo |

R2's free tier (10 GB, 1M Class A, 10M Class B per month) absorbs **local + dev + staging
entirely**, so the non-prod environments cost nothing while still exercising the production API.
The S3 column is ~99% CloudFront egress — that gap is the whole decision.

## Alternatives considered

- **AWS S3 + CloudFront** — the default choice, and ~100× the cost here at every scale. Egress at
  ~$0.09–0.12/GB against a feed workload is the entire bill; the storage line is noise. Rejected on
  cost, not capability.
- **Backblaze B2 + Cloudflare** — cheapest storage ($0.006/GB vs R2's $0.015), free egress through
  the Bandwidth Alliance. But it needs Cloudflare in front *anyway* to reach zero egress, so it buys
  a second vendor and a second bill to save on the term that isn't dominant: **~$31/mo at 100k MAU**.
  It also has no free tier, so dev and staging start costing money. Revisit above ~10 TB stored,
  where the storage delta passes ~$90/mo.
- **Cloudflare Images (managed, per-image billing)** — attractive ergonomics, but priced per stored
  image and per transformation, which scales with *captures*. For an app whose core loop is
  producing new images, that is the wrong meter.
- **Self-hosted MinIO in prod** — no per-GB fees, but VieGo would own durability, replication,
  backup, and CDN integration for a two-person backend. The operational cost dwarfs an $80/mo bill.
  Fine locally; not in prod.
- **Vietnamese providers (VNG Cloud vStorage, Viettel Cloud, Bizfly)** — in-country residency and
  low domestic latency, at higher per-GB pricing and weaker CDN/tooling. Not chosen now, but they
  are the fallback if the residency question below resolves against R2 — which is precisely why the
  S3 API abstraction in §1 is non-negotiable.

## Consequences
- **+** Media cost stays effectively **flat and negligible** through launch, and stays two orders of
  magnitude below the S3 baseline at growth scale. The dominant cost term (egress) is removed rather
  than optimised.
- **+** One product provides storage **and** CDN **and** edge token validation — fewer moving parts
  than S3 + CloudFront + Lambda@Edge.
- **+** All four environments speak the **same S3 API**, so `local` genuinely rehearses `prod`, and
  provider migration is a config change plus a data copy.
- **−** A **new vendor** (Cloudflare) enters the stack alongside the Postgres/Redis provider, with
  its own IAM, quotas, and failure modes to learn and monitor.
- **−** R2 offers **no jurisdictional guarantee** for Vietnam — only a best-effort `apac-se`
  location hint (EU and FedRAMP are the only enforced jurisdictions). See the open question below.
- **−** Client-side derivatives put resize work on the device and make the variant set **hard to
  change retroactively** — adding a fourth size later means a backfill job over existing Beats.
- **−** Edge-token delivery needs a small **Cloudflare Worker**, i.e. a second (tiny) deployable
  outside the monolith's pipeline.

## Open questions
- **Data residency under [Decree 53/2022](https://vietnam-business-law.info/blog/2022/9/4/decree-532022-further-guidance-on-data-localisation-in-vietnam) — blocking before prod.**
  The decree's enumerated categories are account, usage, and relationship data; whether
  user-generated **photos** are in scope for a social network serving Vietnamese users is not
  settled. If they are, prod media must move to an in-country provider. **Owner: Legal/Product ·
  needed by P5.** The S3 abstraction keeps that a migration, not a rewrite.
- **Edge token mechanism** — a hand-rolled HMAC Worker vs. Cloudflare's built-in signed-URL support;
  decide alongside the [Identity](../design/identity.md) token work so one signing story covers both.
- **Moderation and takedown** — deleting a Beat must delete all three variants and purge the edge
  cache; ties into the open review-moderation question in
  [design/content.md](../design/content.md#open-decisions).
- **Backup / second copy** — R2 is durable but single-vendor. Whether Beats warrant a periodic
  cross-provider copy is a business-continuity call, not a durability one.
