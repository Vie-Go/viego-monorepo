package com.viego.social.domain;

import com.viego.shared.domain.BaseTsidEntity;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "feed_entries", schema = "social")
public class FeedEntry extends BaseTsidEntity {

    @Column(name = "subscriber_id", nullable = false)
    private UUID subscriberId; // Logical ref to recipient Explorer UUID

    @Column(name = "beat_id", nullable = false)
    private Long beatId; // TSID ref to content.beats(id)

    @Column(name = "author_id", nullable = false)
    private UUID authorId; // Logical ref to author Explorer UUID

    @Column(name = "feed_type", nullable = false, length = 16)
    private String feedType; // FRIEND_FEED, DISCOVER

    @Column(name = "published_at", nullable = false, updatable = false)
    private Instant publishedAt = Instant.now();

    public FeedEntry() {}

    public FeedEntry(UUID subscriberId, Long beatId, UUID authorId, String feedType) {
        this.subscriberId = subscriberId;
        this.beatId = beatId;
        this.authorId = authorId;
        this.feedType = feedType;
    }

    public UUID getSubscriberId() { return subscriberId; }
    public void setSubscriberId(UUID subscriberId) { this.subscriberId = subscriberId; }
    public Long getBeatId() { return beatId; }
    public void setBeatId(Long beatId) { this.beatId = beatId; }
    public UUID getAuthorId() { return authorId; }
    public void setAuthorId(UUID authorId) { this.authorId = authorId; }
    public String getFeedType() { return feedType; }
    public void setFeedType(String feedType) { this.feedType = feedType; }
    public Instant getPublishedAt() { return publishedAt; }
}
