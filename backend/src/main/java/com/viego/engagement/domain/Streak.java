package com.viego.engagement.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;
import java.util.UUID;

/**
 * An Explorer's daily capture streak. Keyed by the owning Explorer's id rather than a
 * generated key — strictly one row per Explorer.
 */
@Entity
@Table(name = "streaks", schema = "engagement")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Streak implements Serializable {

    @Id
    @Column(name = "explorer_id")
    private UUID explorerId; // Logical ref to identity.explorers(id)

    @Builder.Default
    @Column(name = "current_streak", nullable = false)
    private Integer currentStreak = 0;

    @Builder.Default
    @Column(name = "longest_streak", nullable = false)
    private Integer longestStreak = 0;

    @Column(name = "last_capture_date")
    private LocalDate lastCaptureDate;

    @Builder.Default
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Streak(UUID explorerId) {
        this.explorerId = explorerId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Streak streak = (Streak) o;
        return explorerId != null && Objects.equals(explorerId, streak.explorerId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(explorerId);
    }
}
