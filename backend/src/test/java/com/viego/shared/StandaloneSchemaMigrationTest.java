package com.viego.shared;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
public class StandaloneSchemaMigrationTest {

    @Autowired
    private Flyway identityFlyway;

    @Test
    void testIdentitySchemaFlywayBeanIsActive() {
        assertThat(identityFlyway.info().current()).isNotNull();
    }
}
