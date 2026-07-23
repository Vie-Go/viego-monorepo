package com.viego.identity.domain;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "explorers", schema = "identity")
public class Explorer implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "handle", nullable = false, unique = true, length = 32)
    private String handle;

    @Column(name = "display_name", nullable = false, length = 64)
    private String displayName;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "status", nullable = false, length = 16)
    private String status = "ACTIVE";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Explorer() {}

    public Explorer(String handle, String displayName) {
        this.handle = handle;
        this.displayName = displayName;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getHandle() { return handle; }
    public void setHandle(String handle) { this.handle = handle; }
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Explorer explorer = (Explorer) o;
        return id != null && Objects.equals(id, explorer.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
