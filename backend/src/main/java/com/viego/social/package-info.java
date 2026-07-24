/**
 * The Social bounded context. Integrates with peers only via published domain events or a
 * peer's {@code api} named interface (never internals).
 *
 * <p>Declares its allowed dependencies explicitly so the boundary is enforced by
 * {@code ApplicationModules.verify()} rather than by convention.
 */
@org.springframework.modulith.ApplicationModule(displayName = "Social", allowedDependencies = {"shared", "content::api"})
package com.viego.social;
