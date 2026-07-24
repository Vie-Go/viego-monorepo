package com.viego.content.domain;

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
@Table(name = "reviews", schema = "content")
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class Review extends BaseEntity {

    @Column(name = "explorer_id", nullable = false)
    private UUID explorerId; // Logical ref to identity.explorers(id)

    @Column(name = "place_id", nullable = false)
    private UUID placeId; // Logical ref to exploration.places(id)

    @Column(name = "beat_id", nullable = false)
    private UUID beatId; // Ref to content.beats(id)

    @Column(name = "rating", nullable = false)
    private Short rating;

    @Column(name = "comment", nullable = false)
    private String comment;

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
