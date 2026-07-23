package com.viego.social.domain;

import com.viego.shared.domain.BaseTsidEntity;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "friendships", schema = "social",
       uniqueConstraints = @UniqueConstraint(name = "uk_friendship_pair", columnNames = {"explorer_id", "friend_id"}))
public class Friendship extends BaseTsidEntity {

    @Column(name = "explorer_id", nullable = false)
    private UUID explorerId; // Logical ref to identity.explorers(id)

    @Column(name = "friend_id", nullable = false)
    private UUID friendId; // Logical ref to identity.explorers(id)

    @Column(name = "established_at", nullable = false, updatable = false)
    private Instant establishedAt = Instant.now();

    public Friendship() {}

    public Friendship(UUID explorerId, UUID friendId) {
        this.explorerId = explorerId;
        this.friendId = friendId;
    }

    public UUID getExplorerId() { return explorerId; }
    public void setExplorerId(UUID explorerId) { this.explorerId = explorerId; }
    public UUID getFriendId() { return friendId; }
    public void setFriendId(UUID friendId) { this.friendId = friendId; }
    public Instant getEstablishedAt() { return establishedAt; }
}
