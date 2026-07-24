package com.viego.notification.listener;

import com.viego.engagement.api.MilestoneReachedEvent;
import com.viego.notification.domain.NotificationKind;
import com.viego.notification.service.NotificationService;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Component;

/**
 * Engagement → Notification: a streak milestone becomes a notification.
 *
 * <p>Runs in its own transaction after the publisher commits, so a delivery failure can never roll
 * back the streak that earned the badge.
 */
@Component
public class MilestoneReachedNotificationListener {

    private final NotificationService notifications;

    public MilestoneReachedNotificationListener(NotificationService notifications) {
        this.notifications = notifications;
    }

    @ApplicationModuleListener
    public void onMilestoneReached(MilestoneReachedEvent event) {
        notifications.raise(
                event.explorerId(),
                NotificationKind.MILESTONE_REACHED,
                """
                {"milestone":%d,"badgeCode":"%s"}""".formatted(event.milestone(), event.badgeCode()));
    }
}
