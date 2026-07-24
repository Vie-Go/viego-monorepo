package com.viego.identity;

import com.viego.identity.api.PreferencesUpdated;
import com.viego.identity.application.UpdatePreferencesService;
import com.viego.identity.domain.Explorer;
import com.viego.identity.domain.Preferences;
import com.viego.identity.infrastructure.persistence.ExplorerRepository;
import com.viego.identity.infrastructure.persistence.PreferencesRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

/**
 * Persists wholesale and publishes exactly once per call (FR-009) — no DB needed to run this file
 * standalone in CI, but Testcontainers is required (no Docker in this dev sandbox, see
 * handoff-us1.md's Verification section).
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class UpdatePreferencesServiceTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("viego")
            .withUsername("viego")
            .withPassword("viego");

    @DynamicPropertySource
    static void datasourceProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    ExplorerRepository explorers;

    @Autowired
    PreferencesRepository preferences;

    private final ApplicationEventPublisher eventPublisher = mock(ApplicationEventPublisher.class);

    private Explorer aPersistedExplorer() {
        Explorer explorer = explorers.save(Explorer.builder()
                .handle("test-explorer")
                .displayName("Test Explorer")
                .build());
        preferences.save(Preferences.builder().explorerId(explorer.getId()).build());
        return explorer;
    }

    @Test
    void persistsWholesaleAndPublishesExactlyOncePerCall() {
        Explorer explorer = aPersistedExplorer();
        UpdatePreferencesService service = new UpdatePreferencesService(preferences, eventPublisher);

        Preferences updated = service.update(explorer.getId(), "en", "dark");

        assertThat(updated.getLanguage()).isEqualTo("en");
        assertThat(updated.getTheme()).isEqualTo("dark");
        assertThat(preferences.findById(explorer.getId()).orElseThrow().getLanguage()).isEqualTo("en");
        verify(eventPublisher, times(1)).publishEvent(any(PreferencesUpdated.class));
    }
}
