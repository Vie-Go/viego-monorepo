package com.viego.identity.application;

import com.viego.identity.api.ExplorerRegistered;
import com.viego.identity.domain.AuthProvider;
import com.viego.identity.domain.Explorer;
import com.viego.identity.domain.Preferences;
import com.viego.identity.infrastructure.persistence.AuthProviderRepository;
import com.viego.identity.infrastructure.persistence.ExplorerRepository;
import com.viego.identity.infrastructure.persistence.PreferencesRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

/**
 * Find-or-create entry point for every sign-in provider (FR-001/FR-002/FR-010): looks up the
 * {@code (providerKind, providerSubjectId)} pair; if it already exists, authenticates the
 * existing Explorer, never inserting a second row. Otherwise creates the Explorer, its
 * {@link AuthProvider} link, and its owning {@link Preferences} row (vi/light defaults) in one
 * transaction, and publishes {@link ExplorerRegistered} exactly once — only on create — matching
 * {@code NotificationService.raise}'s pattern.
 */
@Service
public class RegisterOrSignInService {

    private final ExplorerRepository explorers;
    private final AuthProviderRepository authProviders;
    private final PreferencesRepository preferences;
    private final HandleGenerator handleGenerator;
    private final ApplicationEventPublisher eventPublisher;

    public RegisterOrSignInService(
            ExplorerRepository explorers,
            AuthProviderRepository authProviders,
            PreferencesRepository preferences,
            HandleGenerator handleGenerator,
            ApplicationEventPublisher eventPublisher) {
        this.explorers = explorers;
        this.authProviders = authProviders;
        this.preferences = preferences;
        this.handleGenerator = handleGenerator;
        this.eventPublisher = eventPublisher;
    }

    /** The verified identity a provider handed us — already proven, never re-verified here. */
    public record Identity(String providerKind, String providerSubjectId, String displayName, String avatarUrl) {}

    @Transactional
    public Explorer registerOrSignIn(Identity identity) {
        Optional<AuthProvider> existingLink = authProviders.findByProviderKindAndProviderSubjectId(
                identity.providerKind(), identity.providerSubjectId());
        if (existingLink.isPresent()) {
            return explorers.findById(existingLink.get().getExplorerId())
                    .orElseThrow(() -> new IllegalStateException(
                            "AuthProvider " + existingLink.get().getId() + " has no owning Explorer"));
        }

        String displayName = identity.displayName() != null && !identity.displayName().isBlank()
                ? identity.displayName()
                : identity.providerSubjectId();
        String handle = handleGenerator.generate(displayName);

        Explorer explorer = explorers.save(Explorer.builder()
                .handle(handle)
                .displayName(displayName)
                .avatarUrl(identity.avatarUrl())
                .build());

        authProviders.save(AuthProvider.builder()
                .explorerId(explorer.getId())
                .providerKind(identity.providerKind())
                .providerSubjectId(identity.providerSubjectId())
                .build());

        // Preferences.builder() (not the `new Preferences(id)` constructor) is required here —
        // @Builder.Default only wires vi/light defaults through the generated builder path.
        preferences.save(Preferences.builder().explorerId(explorer.getId()).build());

        // Published in the same transaction; the Modulith event log makes delivery at-least-once.
        eventPublisher.publishEvent(new ExplorerRegistered(explorer.getId(), explorer.getHandle(), Instant.now()));

        return explorer;
    }
}
