---
title: "Developer Integration Guides"
description: "How developers build against and contribute to Vibeat (partially generated)."
---

# Developer Integration Guides

For developers building the app/backend or integrating with the API. Partially generated from the
[Core Specifications](../01-core-specifications/).

## Quick start
```bash
# Backend (Spring Boot, Java 25)
./gradlew bootRun                      # modular monolith on :8080
./gradlew test --tests '*ModularityTests'   # verify module boundaries

# Mobile (React Native)
npm install && npm run ios             # or: npm run android

# Reference prototype (interactive map + datasets)
cd prototype && npm start
```

## Working against the API
- Contract: [OpenAPI](../01-core-specifications/api-system-specifications/rest-api.openapi.yaml) →
  interactive [API Reference](../03-generated-system-artifacts/api-reference-documentation.md).
- Generated TS client & types: [Source Code Models](../03-generated-system-artifacts/source-code-models.md).
- Auth: Bearer JWT (see [Security](system-admin-documentation/security.md)).

## Contributing
- Follow [SDD Standards](../../02-process-documentation/sdd-standards/) and the
  [architecture principles](../02-authored-system-documentation/software-architecture-document/architecture-principles.md).
- Change behaviour by editing the [Core Specifications](../01-core-specifications/) first.
- Keep [module boundaries](../02-authored-system-documentation/software-architecture-document/backend-modular-monolith.md) intact.

> SDK docs are generated once the client packages exist; this guide links them.
