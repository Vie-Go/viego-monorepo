---
title: "Canonical Data Schemas"
description: "Field-level schemas for VieGo's canonical province/ward datasets and the Place, Beat, and Review shapes."
---

# Canonical Data Schemas

Field-level documentation for VieGo's canonical datasets (currently in
[`prototype/data/`](../../../../../prototype/data/)) plus the core user-generated shapes (Place,
Beat, Review) modelled by the `exploration` and `content` modules. The `exploration` module ingests
the geographic datasets; **do not fork or hand-edit derived copies.**

## `provinces-metadata.json`
Per-province metadata consumed by the map. One object per province.

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Stable province identifier (links to GeoJSON `properties.id`) |
| `mahc` | number | Administrative code |
| `name` | string | Province name (VI; EN localization added in the `exploration` model) |
| `area` | number | Area in km² |
| `population` | number | Population |
| `adminCenter` | string | Administrative-center note (post-merger) |
| `longitude` / `latitude` | number | Centroid coordinates |
| `beforeMerger` | string | Pre-merger note |
| `adminUnits` | string | Count/description of administrative units (wards/communes) |
| `isMerged` | boolean | Whether the province resulted from a 2025 merger |

## `vietnam-provinces.geojson`
Province geometry as a GeoJSON `FeatureCollection`.

| Field | Type | Description |
|-------|------|-------------|
| `features[].properties.id` | string/number | Links to `provinces-metadata.json.id` |
| `features[].geometry` | GeoJSON geometry | Province boundary |

## `wards-metadata`
Ward-level metadata directory — sub-divisions of each province.

## `vietnam-map.svg`
Interactive SVG artwork; province `<path>` elements keyed by id (rendered by the app's map
component, ported from the prototype `<vn-map>`). The map shades provinces by **public check-in
heat** and fills **unlocked** provinces gold.

## Place (POI)
A specific point of interest on the map (owned by `exploration`). Seeded from the prototype's `POIS`.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Stable place id (e.g. `giang`, `halong`) |
| `name` | string | Display name (e.g. "Giảng Café") |
| `provinceId` | string | Owning province |
| `category` | enum | `coffee` \| `food` \| `heritage` \| `nightlife` \| `nature` \| `hidden` |
| `localName` | string | "locals say" tagline (e.g. "cà phê trứng gốc") |
| `coordinates` | `{x, y}` / lat-long | Map position |
| `description` | LocalizedText | "Why it matters" context |
| `hours` / `cost` / `localTip` | string | Practical visitor info |
| `rating` | number | Aggregate rating |

## Beat
A photo check-in (owned by `content`). Immutable once captured.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Beat id |
| `explorerId` | string | Author |
| `photoRef` | string | Object-storage prefix for the `thumb/`, `feed/`, `orig/` variants; served as a signed/CDN URL |
| `placeId` | string? | Tagged place, if any |
| `provinceId` | string | Resolved province (suppressed outside Vietnam) |
| `caption` | string? | Optional caption |
| `audience` | enum | `friends` \| `public` |
| `recipients` | string[] | Friend ids, when `audience=friends` |
| `capturedAt` | date-time | Capture timestamp |

## Review
A traveller's note on a Place (owned by `content`), allowed only for Explorers who captured a Beat there.

| Field | Type | Description |
|-------|------|-------------|
| `explorerId` | string | Author |
| `placeId` | string | Reviewed place |
| `note` | string | Free text |
| `rating` | number | Stars |
| `capturedAt` | date-time | When written |

> The geographic datasets are canonical inputs; Place/Beat/Review shapes above are the model
> `exploration`/`content` expose — see the [OpenAPI contract](rest-api.openapi.yaml) for the exact
> API representations.
