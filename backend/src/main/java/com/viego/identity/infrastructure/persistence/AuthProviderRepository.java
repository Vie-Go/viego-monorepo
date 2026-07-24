package com.viego.identity.infrastructure.persistence;

import com.viego.identity.domain.AuthProvider;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AuthProviderRepository extends JpaRepository<AuthProvider, UUID> {

    Optional<AuthProvider> findByProviderKindAndProviderSubjectId(String providerKind, String providerSubjectId);
}
