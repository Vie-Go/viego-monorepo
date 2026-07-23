package com.viego.engagement.domain;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "streaks", schema = "engagement")
public class Streak implements Serializable {

    @Id
    @Column(name = "explorer_id")
    private UUID explorerId; // Logical ref to identity.explorers(id)

    @Column(name = "current_streak", nullable = false)
    private Integer currentStreak = 0;

    @Column(name = "longest_streak", nullable = false)
    private Integer longestStreak = 0;

    @Column(name = "last_capture_date")
    private LocalDate lastCaptureDate;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Streak() {}

    public Streak(UUID explorerId) {
        this.explorerId = explorerId;
    }

    public UUID getExplorerId() { return explorerId; }
    public void setExplorerId(UUID explorerId) { this.explorerId = explorerId; }
    public Integer getCurrentStreak() { return currentStreak; }
    public void setCurrentStreak(Integer currentStreak) { this.currentStreak = currentStreak; }
    public Integer getLongestStreak() { return longestStreak; }
    public void setLongestStreak(Integer longestStreak) { this.longestStreak = longestStreak; }
    public LocalDate getLastCaptureDate() { return lastCaptureDate; }
    public void setLastCaptureDate(LocalDate lastCaptureDate) { this.lastCaptureDate = lastCaptureDate; }
    public Instant getUpdatedAt() { return updatedAt; }

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
