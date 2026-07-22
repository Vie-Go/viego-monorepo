---
title: "Components — Map"
description: "The interactive Vietnam SVG map and its pins, clusters, and heat legend, ported to react-native-svg."
---

# Components — Map

The interactive Vietnam map is VieGo's centerpiece. The prototype implements it as the
`<vn-map>` web component ([`prototype/vn-map.js`](../../../../../prototype/vn-map.js)) inlining
[`assets/vietnam-map.svg`](../../../../../prototype/assets/vietnam-map.svg) (34 provinces +
Hoàng Sa / Trường Sa archipelagos). For React Native it is re-implemented with
**`react-native-svg`** in `features/exploration/components`.

---

## VnMap

The map surface. Two rendering modes: **heat** (check-in choropleth, Map Home) and
**unlocked** (gold collection fill, Profile/Collection).

- **Source.** Parse `vietnam-map.svg` into `<Path>` elements at build time (an SVG→JSX/`Path`
  transform or a generated paths module), each keyed by its `data-province` name. Ship the SVG
  in `assets`. Preserve `preserveAspectRatio="xMidYMid meet"`; wrap in a fixed `390/690` aspect
  container.
- **Props.**
  - `unlocked?: string[]` — provinces filled with `mapUnlocked`.
  - `heat?: Record<string, number>` — per-province check-in counts → tiered fill.
  - `interactive?: boolean` — provinces become `Pressable`; fires `onProvincePick(name, count)`.
  - `onProvincePick?(name, count)` — replaces the prototype's bubbling `province-pick` event.
- **Fill logic** (from `applyFills`, keep the thresholds):

  | Condition | Fill |
  |---|---|
  | heat count ≥ 10000 | `palette.heat[4]` `#BE382A` (stroke 1) |
  | ≥ 1000 | `palette.heat[3]` `#DE9B27` (stroke 1) |
  | ≥ 100 | `palette.heat[2]` `#E9BA55` |
  | ≥ 10 | `palette.heat[1]` `#F0CF8C` |
  | ≥ 1 | `palette.heat[0]` `#F6E3BC` |
  | unlocked (no heat) | `mapUnlocked` |
  | otherwise | `mapProvince` |

  Stroke `mapStroke`, width 0.7 (1.0 for the top two tiers). Fill transitions 0.3s (`fill .3s`)
  → animate via Reanimated color interpolation; snap under reduced motion.
- **RN notes.** Province `<Path>`s wrapped so each is individually pressable (hit-slop for small
  provinces/archipelagos). Selected province may get an emphasis (raised stroke / subtle
  `vbPing`). Keep the map performant on low-end devices — memoize paths, avoid re-rendering all
  provinces on selection (see the [map-performance risk](../../../../02-process-documentation/plans-estimates-schedules.md#risks--mitigations)).
- **A11y.** The SVG is decorative to screen readers; expose a **text summary** alongside
  (e.g. "9 of 34 provinces unlocked"). Interactive provinces get an `accessibilityLabel` of
  name + status (locked / unlocked / N check-ins) and `accessibilityRole="button"`.

## MapProvincePath

A single province path (internal to `VnMap`).

- **Props.** `name`, `d` (path data), `fill`, `stroke`, `strokeWidth`, `selected?`,
  `onPress?`.
- **Behavior.** Animates `fill` on change; applies the selected emphasis; forwards presses with
  its province name.

## MapPin

Location marker (component-set reference; used for spot pins / selected location).

- **Shape.** 22px teardrop (`border-radius:50% 50% 50% 0` rotated -45°), 2px white border, inner
  7px dot, drop shadow. **Default** = crimson; **selected** = gold, scaled 1.2×.
- **Props.** `variant` (`default` | `selected`), `x`, `y`.
- **RN notes.** Draw as SVG within the map layer, or as an absolutely-positioned view over the
  map. A11y label = the spot/place name.

## MapCluster

Aggregated-pin bubble when markers overlap.

- **Shape.** 38px crimson circle, 3px white border, white count (14/800), crimson glow.
- **Props.** `count`, `onPress` (zoom / expand).
- **A11y.** Label "N places here".

## HeatLegend

The check-in density legend on [Map Home](../screens/exploration.md#map-home).

- **Shape.** Small pill on `navBg` + `line` border, top-right of the map; label "check-ins", the
  5-step `palette.heat` swatch ramp (10px rounded squares), and a "10k+" cap label.
- **Props.** none (static) or `ramp`/`maxLabel` for reuse.
- **A11y.** Provide a textual description ("check-in density, light to dark = few to 10k+");
  don't rely on color alone — the [Province Sheet](../screens/exploration.md#province-sheet)
  states exact counts.
