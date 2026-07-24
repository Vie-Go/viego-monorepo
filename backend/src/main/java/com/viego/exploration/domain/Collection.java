package com.viego.exploration.domain;

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
@Table(name = "collections", schema = "exploration",
       uniqueConstraints = @UniqueConstraint(name = "uk_collection_explorer_province", columnNames = {"explorer_id", "province_id"}))
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class Collection extends BaseEntity {

    @Column(name = "explorer_id", nullable = false)
    private UUID explorerId; // Logical ref to identity.explorers(id)

    @Column(name = "province_id", nullable = false, length = 16)
    private String provinceId;

    @Builder.Default
    @Column(name = "unlocked_at", nullable = false, updatable = false)
    private Instant unlockedAt = Instant.now();

    @Column(name = "first_beat_id", nullable = false)
    private UUID firstBeatId; // Logical ref to content.beats(id)
}
