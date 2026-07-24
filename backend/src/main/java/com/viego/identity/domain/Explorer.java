package com.viego.identity.domain;

import com.viego.shared.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.Instant;

@Entity
@Table(name = "explorers", schema = "identity")
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class Explorer extends BaseEntity {

    @Column(name = "handle", nullable = false, unique = true, length = 32)
    private String handle;

    @Column(name = "display_name", nullable = false, length = 64)
    private String displayName;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Builder.Default
    @Column(name = "status", nullable = false, length = 16)
    private String status = "ACTIVE";

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Builder.Default
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();
}
