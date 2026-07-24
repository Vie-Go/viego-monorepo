package com.viego.identity.infrastructure.persistence;

import com.viego.identity.domain.Preferences;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PreferencesRepository extends JpaRepository<Preferences, UUID> {
}
