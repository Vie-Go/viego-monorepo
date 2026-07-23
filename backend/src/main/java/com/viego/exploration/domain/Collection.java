package com.viego.exploration.domain;

import com.viego.shared.domain.BaseTsidEntity;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "collections", schema = "exploration",
       uniqueConstraints = @UniqueConstraint(name = "uk_collection_explorer_province", columnNames = {"explorer_id", "province_id"}))
public class Collection extends BaseTsidEntity {

    @Column(name = "explorer_id", nullable = false)
    private UUID explorerId; // Logical ref to identity.explorers(id)

    @Column(name = "province_id", nullable = false, length = 16)
    private String provinceId;

    @Column(name = "unlocked_at", nullable = false, updatable = false)
    private Instant unlockedAt = Instant.now();

    @Column(name = "first_beat_id", nullable = false)
    private Long firstBeatId; // Logical ref to content.beats(id) (TSID)

    public Collection() {}

    public Collection(UUID explorerId, String provinceId, Long firstBeatId) {
        this.explorerId = explorerId;
        this.provinceId = provinceId;
        this.firstBeatId = firstBeatId;
    }

    public UUID getExplorerId() { return explorerId; }
    public void setExplorerId(UUID explorerId) { this.explorerId = explorerId; }
    public String getProvinceId() { return provinceId; }
    public void setProvinceId(String provinceId) { this.provinceId = provinceId; }
    public Instant getUnlockedAt() { return unlockedAt; }
    public Long getFirstBeatId() { return firstBeatId; }
    public void setFirstBeatId(Long firstBeatId) { this.firstBeatId = firstBeatId; }
}
