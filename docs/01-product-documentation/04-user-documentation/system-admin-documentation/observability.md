---
title: "Observability"
description: "Logs, metrics, traces, health checks, and alerting."
---

# Observability

## The three signals
- **Logs:** structured JSON, correlation id per request, no PII.
- **Metrics:** Micrometer → Prometheus-compatible. Per-module throughput/latency/errors,
  event-log backlog, and product metrics (unlock/streak rates).
- **Traces:** OpenTelemetry; propagate app → API → DB, and across event handling to see the
  cross-context effects of `ProvinceUnlocked` etc.

## Health & readiness
- Spring Boot Actuator `/actuator/health` gates deployments.
- Monitor the **Spring Modulith event-publication log** for undelivered/failed events — a growing
  backlog is a key alert (event delivery is the backbone of module integration).

## Alerting (starter set)
| Alert | Signal |
|-------|--------|
| 5xx error-rate spike | metrics |
| Latency p95 breach | metrics |
| Failed/incomplete events rising | event log |
| DB connection saturation | metrics |
| Crash-free sessions drop (mobile) | RN crash reporting |

## Mobile
- Crash + performance reporting (e.g. Sentry); track crash-free rate per release.

> Pick concrete backends (Prometheus/Grafana, OTel collector, Sentry) and record an ADR.
