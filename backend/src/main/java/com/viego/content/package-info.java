/**
 * The Content bounded context. Empty skeleton in Phase 0 — later phases add
 * aggregates, events, and persistence. Integrates with peers only via published
 * domain events or a peer's {@code api} named interface (never internals).
 *
 * <p>{@code allowedDependencies = {}} makes the boundary strict from day one: this
 * module may depend on nothing but the OPEN {@code shared} kernel. Later phases add
 * explicit allowed dependencies as real integration is introduced.
 */
@org.springframework.modulith.ApplicationModule(displayName = "Content", allowedDependencies = {"shared"})
package com.viego.content;
