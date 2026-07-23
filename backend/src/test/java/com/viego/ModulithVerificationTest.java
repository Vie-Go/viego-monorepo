package com.viego;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;

/**
 * Module-boundary gate (FR-005). Pure static analysis — no Spring context or database.
 * Fails the build if any module imports another module's internals, joins another module's
 * tables, or otherwise violates the {@code api}-only boundary. This is the day-one guarantee
 * every later phase inherits.
 */
class ModulithVerificationTest {

	@Test
	void verifiesModuleBoundaries() {
		ApplicationModules.of(VieGoApplication.class).verify();
	}
}
