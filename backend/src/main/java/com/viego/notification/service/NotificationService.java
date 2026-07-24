package com.viego.notification.service;

import com.viego.notification.api.NotificationRaised;
import com.viego.notification.domain.Notification;
import com.viego.notification.domain.NotificationKind;
import com.viego.notification.persistence.NotificationRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

/**
 * The single entry point for creating a notification.
 *
 * <p>Every listener in this module funnels through {@link #raise}, so the rules about what an
 * Explorer may receive live in exactly one place rather than being re-decided per publishing
 * context.
 */
@Service
public class NotificationService {

    private final NotificationRepository notifications;
    private final ApplicationEventPublisher eventPublisher;

    public NotificationService(NotificationRepository notifications, ApplicationEventPublisher eventPublisher) {
        this.notifications = notifications;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public Notification raise(UUID recipientId, NotificationKind kind, String payloadJson) {
        Notification notification = notifications.save(Notification.builder()
                .recipientId(recipientId)
                .kind(kind)
                .payloadJson(payloadJson)
                .build());

        // Published in the same transaction; the Modulith event log makes delivery at-least-once.
        eventPublisher.publishEvent(new NotificationRaised(
                notification.getId(),
                notification.getRecipientId(),
                notification.getKind().name(),
                notification.getCreatedAt()));

        return notification;
    }

    @Transactional
    public void markRead(UUID notificationId) {
        notifications.findById(notificationId)
                .ifPresent(notification -> notification.markRead(Instant.now()));
    }
}
