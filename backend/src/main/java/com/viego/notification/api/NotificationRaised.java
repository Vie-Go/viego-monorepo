package com.viego.notification.api;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

/**
 * Domain event emitted when a notification has been recorded for an Explorer.
 *
 * <p>Published so that delivery channels (push, email) can react without Notification knowing
 * about them, and so peers can observe delivery without being able to trigger it.
 */
public record NotificationRaised(
        UUID notificationId,
        UUID recipientId,
        String kind,
        Instant raisedAt
) implements Serializable {}
