/**
 * Thin shared kernel — stable cross-cutting value objects only (ids, LocalizedText).
 * Declared OPEN so any module may depend on it; MUST hold no business logic.
 */
@org.springframework.modulith.ApplicationModule(
		displayName = "Shared Kernel",
		type = org.springframework.modulith.ApplicationModule.Type.OPEN)
package com.viego.shared;
