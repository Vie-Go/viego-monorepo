package com.viego;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;

/**
 * Spring Modulith Architecture Verification Test.
 * Ensures module boundary rules are strictly maintained and no cyclic or unallowed
 * cross-module dependencies exist across identity, exploration, content, engagement, and social modules.
 */
public class ApplicationModulesTest {

    @Test
    void verifyModuleStructure() {
        ApplicationModules modules = ApplicationModules.of(ApplicationModulesTest.class);
        modules.verify();
    }
}
