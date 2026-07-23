package com.viego.engagement.domain;

import com.viego.shared.domain.BaseTsidEntity;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "notifications", schema = "engagement")
public class Notification extends BaseTsidEntity {

    @Column(name = "recipient_id", nullable = false)
    private UUID recipientId; // Logical ref to identity.explorers(id)

    @Column(name = "kind", nullable = false, length = 32)
    private String kind;

    @Column(name = "payload_json", nullable = false, columnDefinition = "jsonb")
    private String payloadJson;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Notification() {}

    public Notification(UUID recipientId, String kind, String payloadJson) {
        this.recipientId = recipientId;
        this.kind = kind;
        this.payloadJson = payloadJson;
    }

    public UUID getRecipientId() { return recipientId; }
    public void setRecipientId(UUID recipientId) { this.recipientId = recipientId; }
    public String getKind() { return kind; }
    public void setKind(String kind) { this.kind = kind; }
    public String getPayloadJson() { return payloadJson; }
    public void setPayloadJson(String payloadJson) { this.payloadJson = payloadJson; }
    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }
    public Instant getCreatedAt() { return createdAt; }
}
