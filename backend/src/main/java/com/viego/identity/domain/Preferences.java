package com.viego.identity.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * Explorer preferences. Keyed by the owning Explorer's id rather than a generated key —
 * strictly one row per Explorer.
 */
@Entity
@Table(name = "preferences", schema = "identity")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Preferences implements Serializable {

    @Id
    @Column(name = "explorer_id")
    private UUID explorerId;

    @Builder.Default
    @Column(name = "language", nullable = false, length = 8)
    private String language = "vi";

    @Builder.Default
    @Column(name = "theme", nullable = false, length = 8)
    private String theme = "system";

    @Builder.Default
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Preferences(UUID explorerId) {
        this.explorerId = explorerId;
    }

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
