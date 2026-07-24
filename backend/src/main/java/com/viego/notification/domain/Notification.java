package com.viego.notification.domain;

import com.viego.shared.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.Instant;
import java.util.UUID;

/**
 * A single notification addressed to one Explorer.
 *
 * <p>Immutable except for its read state: the payload records what happened at the moment it
 * happened, so a later change in a peer context never rewrites history the Explorer already saw.
 */
@Entity
@Table(name = "notifications", schema = "notification")
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class Notification extends BaseEntity {

    @Column(name = "recipient_id", nullable = false)
    private UUID recipientId; // Logical ref to identity.explorers(id)

    @Enumerated(EnumType.STRING)
    @Column(name = "kind", nullable = false, length = 32)
    private NotificationKind kind;

    @Column(name = "payload_json", nullable = false, columnDefinition = "jsonb")
    private String payloadJson;

    @Builder.Default
    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Column(name = "read_at")
    private Instant readAt;

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    /** Marks the notification read. Idempotent — re-reading never moves {@code readAt}. */
    public void markRead(Instant at) {
        if (Boolean.TRUE.equals(this.isRead)) {
            return;
        }
        this.isRead = true;
        this.readAt = at;
    }
}
