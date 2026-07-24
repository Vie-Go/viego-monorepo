package com.viego.identity.domain;

import com.viego.shared.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "auth_providers", schema = "identity",
       uniqueConstraints = @UniqueConstraint(name = "uk_auth_provider_kind_sub", columnNames = {"provider_kind", "provider_subject_id"}))
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class AuthProvider extends BaseEntity {

    @Column(name = "explorer_id", nullable = false)
    private UUID explorerId; // Logical ref to identity.explorers(id)

    @Column(name = "provider_kind", nullable = false, length = 16)
    private String providerKind;

    @Column(name = "provider_subject_id", nullable = false, length = 128)
    private String providerSubjectId;

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
