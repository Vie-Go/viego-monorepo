package com.viego.social.domain;

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
@Table(name = "feed_entries", schema = "social")
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class FeedEntry extends BaseEntity {

    @Column(name = "subscriber_id", nullable = false)
    private UUID subscriberId; // Logical ref to recipient Explorer

    @Column(name = "beat_id", nullable = false)
    private UUID beatId; // Logical ref to content.beats(id)

    @Column(name = "author_id", nullable = false)
    private UUID authorId; // Logical ref to author Explorer

    @Column(name = "feed_type", nullable = false, length = 16)
    private String feedType; // FRIEND_FEED, DISCOVER

    @Builder.Default
    @Column(name = "published_at", nullable = false, updatable = false)
    private Instant publishedAt = Instant.now();
}
