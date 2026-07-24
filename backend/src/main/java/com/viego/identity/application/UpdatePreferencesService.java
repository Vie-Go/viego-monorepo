package com.viego.identity.application;

import com.viego.identity.api.PreferencesUpdated;
import com.viego.identity.domain.Preferences;
import com.viego.identity.infrastructure.persistence.PreferencesRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

/**
 * Replaces an Explorer's {@link Preferences} row wholesale (value-object semantics — no partial
 * {@code PATCH}, per data-model.md) and publishes {@link PreferencesUpdated} in the same
 * transaction (FR-009).
 */
@Service
public class UpdatePreferencesService {

    private final PreferencesRepository preferences;
    private final ApplicationEventPublisher eventPublisher;

    public UpdatePreferencesService(PreferencesRepository preferences, ApplicationEventPublisher eventPublisher) {
        this.preferences = preferences;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public Preferences update(UUID explorerId, String language, String theme) {
        Preferences updated = preferences.save(Preferences.builder()
                .explorerId(explorerId)
                .language(language)
                .theme(theme)
                .updatedAt(Instant.now())
                .build());

        eventPublisher.publishEvent(new PreferencesUpdated(explorerId, language, theme, updated.getUpdatedAt()));

        return updated;
    }
}
