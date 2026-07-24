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
@Table(name = "beats", schema = "content")
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class Beat extends BaseEntity {

    @Column(name = "explorer_id", nullable = false)
    private UUID explorerId; // Logical ref to identity.explorers(id)

    @Column(name = "place_id", nullable = false)
    private UUID placeId; // Logical ref to exploration.places(id)

    @Column(name = "province_id", nullable = false, length = 16)
    private String provinceId; // Logical ref to exploration.provinces(id)

    @Column(name = "media_url", nullable = false)
    private String mediaUrl;

    @Column(name = "caption")
    private String caption;

    @Column(name = "audience", nullable = false, length = 16)
    private String audience; // FRIENDS, PUBLIC

    @Builder.Default
    @Column(name = "captured_at", nullable = false, updatable = false)
    private Instant capturedAt = Instant.now();
}
