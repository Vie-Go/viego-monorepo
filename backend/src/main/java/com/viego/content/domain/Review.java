package com.viego.content.domain;

import com.viego.shared.domain.BaseTsidEntity;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "reviews", schema = "content")
public class Review extends BaseTsidEntity {

    @Column(name = "explorer_id", nullable = false)
    private UUID explorerId; // Logical ref to identity.explorers(id)

    @Column(name = "place_id", nullable = false)
    private Long placeId; // Logical ref to exploration.places(id) (TSID)

    @Column(name = "beat_id", nullable = false)
    private Long beatId; // TSID ref to content.beats(id)

    @Column(name = "rating", nullable = false)
    private Integer rating;

    @Column(name = "comment", nullable = false)
    private String comment;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Review() {}

    public UUID getExplorerId() { return explorerId; }
    public void setExplorerId(UUID explorerId) { this.explorerId = explorerId; }
    public Long getPlaceId() { return placeId; }
    public void setPlaceId(Long placeId) { this.placeId = placeId; }
    public Long getBeatId() { return beatId; }
    public void setBeatId(Long beatId) { this.beatId = beatId; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public Instant getCreatedAt() { return createdAt; }
}
