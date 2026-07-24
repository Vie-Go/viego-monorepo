/**
 * The Identity bounded context. Empty skeleton in Phase 0 — later phases add
 * aggregates, events, and persistence. Integrates with peers only via published
 * domain events or a peer's {@code api} named interface (never internals).
 *
 * <p>Identity is the upstream supplier to every other context and consumes no peer's events,
 * so it depends only on the {@code shared} kernel (its entities extend the shared
 * {@code BaseEntity}). Later phases add explicit allowed dependencies only if real integration
 * is introduced.
 */
@org.springframework.modulith.ApplicationModule(displayName = "Identity", allowedDependencies = {"shared"})
package com.viego.identity;
