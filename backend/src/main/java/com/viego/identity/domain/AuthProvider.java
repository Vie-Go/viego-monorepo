package com.viego.identity.domain;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "auth_providers", schema = "identity",
       uniqueConstraints = @UniqueConstraint(name = "uk_auth_provider_kind_sub", columnNames = {"provider_kind", "provider_subject_id"}))
public class AuthProvider implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "explorer_id", nullable = false)
    private UUID explorerId;

    @Column(name = "provider_kind", nullable = false, length = 16)
    private String providerKind;

    @Column(name = "provider_subject_id", nullable = false, length = 128)
    private String providerSubjectId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public AuthProvider() {}

    public AuthProvider(UUID explorerId, String providerKind, String providerSubjectId) {
        this.explorerId = explorerId;
        this.providerKind = providerKind;
        this.providerSubjectId = providerSubjectId;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getExplorerId() { return explorerId; }
    public void setExplorerId(UUID explorerId) { this.explorerId = explorerId; }
    public String getProviderKind() { return providerKind; }
    public void setProviderKind(String providerKind) { this.providerKind = providerKind; }
    public String getProviderSubjectId() { return providerSubjectId; }
    public void setProviderSubjectId(String providerSubjectId) { this.providerSubjectId = providerSubjectId; }
    public Instant getCreatedAt() { return createdAt; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AuthProvider that = (AuthProvider) o;
        return id != null && Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
