package com.viego.notification.persistence;

import com.viego.notification.domain.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

/**
 * Persistence port for {@link Notification}. Internal to the Notification module — peers reach
 * notifications only through the REST API or by publishing an event this module listens to.
 */
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    Page<Notification> findByRecipientIdOrderByCreatedAtDesc(UUID recipientId, Pageable pageable);

    long countByRecipientIdAndIsReadFalse(UUID recipientId);
}
