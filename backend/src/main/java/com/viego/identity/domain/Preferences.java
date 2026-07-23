package com.viego.identity.domain;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "preferences", schema = "identity")
public class Preferences implements Serializable {

    @Id
    @Column(name = "explorer_id")
    private UUID explorerId;

    @Column(name = "language", nullable = false, length = 8)
    private String language = "vi";

    @Column(name = "theme", nullable = false, length = 8)
    private String theme = "system";

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Preferences() {}

    public Preferences(UUID explorerId) {
        this.explorerId = explorerId;
    }

    public UUID getExplorerId() { return explorerId; }
    public void setExplorerId(UUID explorerId) { this.explorerId = explorerId; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }
    public Instant getUpdatedAt() { return updatedAt; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Preferences that = (Preferences) o;
        return explorerId != null && Objects.equals(explorerId, that.explorerId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(explorerId);
    }
}
