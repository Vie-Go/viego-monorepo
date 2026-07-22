---
title: "Canonical Data Schemas"
description: "Field-level schemas for Vibeat's canonical province/ward datasets."
---

# Canonical Data Schemas

Field-level documentation for Vibeat's canonical datasets (currently in
[`prototype/data/`](../../../../../prototype/data/)). The `exploration` module ingests these;
**do not fork or hand-edit derived copies.**

## `provinces-metadata.json`
Per-province metadata consumed by the map and heritage surfaces.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Stable province identifier (links to GeoJSON `properties.id`) |
| `name` | string / localized | Province name (VI; EN to be added) |
| _…_ | _…_ | _Complete from the dataset file_ |

## `vietnam-provinces.geojson`
Province/ward geometry as a GeoJSON `FeatureCollection`.

| Field | Type | Description |
|-------|------|-------------|
| `features[].properties.id` | string | Links to `provinces-metadata.json.id` |
| `features[].geometry` | GeoJSON geometry | Province boundary |
| _…_ | _…_ | _Complete from the dataset file_ |

## `vietnam-map.svg`
Interactive SVG artwork; province `<path>` elements keyed by id (rendered by the app's map
component, ported from the prototype `<vn-map>`).

> TODO: extract exact field lists directly from the dataset files to complete these tables.
