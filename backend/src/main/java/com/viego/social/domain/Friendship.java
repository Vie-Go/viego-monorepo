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
@Table(name = "friendships", schema = "social",
       uniqueConstraints = @UniqueConstraint(name = "uk_friendship_pair", columnNames = {"explorer_id", "friend_id"}))
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class Friendship extends BaseEntity {

    @Column(name = "explorer_id", nullable = false)
    private UUID explorerId; // Logical ref to identity.explorers(id)

    @Column(name = "friend_id", nullable = false)
    private UUID friendId; // Logical ref to identity.explorers(id)

    @Builder.Default
    @Column(name = "established_at", nullable = false, updatable = false)
    private Instant establishedAt = Instant.now();
}
