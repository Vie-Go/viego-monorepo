package com.viego.identity;

import com.viego.identity.api.ExplorerRegistered;
import com.viego.identity.application.HandleGenerator;
import com.viego.identity.application.RegisterOrSignInService;
import com.viego.identity.domain.Explorer;
import com.viego.identity.infrastructure.persistence.AuthProviderRepository;
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

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

/**
 * Persistence-level proof of FR-002/FR-010: a repeat sign-in never inserts a second Explorer row
 * even under a simulated retry, the Preferences row exists immediately at creation with vi/light
 * defaults, and ExplorerRegistered publishes exactly once — only on the first call.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class RegisterOrSignInServiceTest {

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
    AuthProviderRepository authProviders;

    @Autowired
    PreferencesRepository preferences;

    private final ApplicationEventPublisher eventPublisher = mock(ApplicationEventPublisher.class);

    private RegisterOrSignInService service() {
        return new RegisterOrSignInService(
                explorers, authProviders, preferences, new HandleGenerator(explorers), eventPublisher);
    }

    @Test
    void createsExactlyOnceUnderARetriedCall() {
        RegisterOrSignInService service = service();
        var identity = new RegisterOrSignInService.Identity("google", "sub-123", "Minh Dinh", null);

        Explorer first = service.registerOrSignIn(identity);
        Explorer second = service.registerOrSignIn(identity); // simulated retry — same identity

        assertThat(second.getId()).isEqualTo(first.getId());
        assertThat(explorers.count()).isEqualTo(1);
        assertThat(authProviders.count()).isEqualTo(1);

        verify(eventPublisher, times(1)).publishEvent(org.mockito.ArgumentMatchers.any(ExplorerRegistered.class));
    }

    @Test
    void defaultPreferencesRowExistsImmediatelyAtCreation() {
        Explorer explorer = service().registerOrSignIn(
                new RegisterOrSignInService.Identity("email", "explorer@example.com", "explorer", null));

        Optional<com.viego.identity.domain.Preferences> prefs = preferences.findById(explorer.getId());
        assertThat(prefs).isPresent();
        assertThat(prefs.get().getLanguage()).isEqualTo("vi");
        assertThat(prefs.get().getTheme()).isEqualTo("light");
    }

    @Test
    void publishesExplorerRegisteredOnlyOnCreate() {
        var identity = new RegisterOrSignInService.Identity("google", "sub-456", "Second Explorer", null);
        RegisterOrSignInService service = service();

        service.registerOrSignIn(identity);
        service.registerOrSignIn(identity);
        service.registerOrSignIn(identity);

        verify(eventPublisher, times(1)).publishEvent(org.mockito.ArgumentMatchers.any(ExplorerRegistered.class));
    }
}
