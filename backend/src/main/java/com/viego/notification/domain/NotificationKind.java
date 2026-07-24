package com.viego.notification.domain;

/**
 * The kinds of notification an Explorer can receive, one per publishing context
 * ([FR-NT-01]). The kind — not the payload — decides how a row renders on the
 * Notifications screen and which delivery channels apply.
 */
public enum NotificationKind {

    /** Engagement: the daily streak is at risk of breaking. */
    STREAK_REMINDER,

    /** Engagement: a streak milestone awarded a badge. */
    MILESTONE_REACHED,

    /** Exploration: a province was added to the Collection. */
    PROVINCE_UNLOCKED,

    /** Social: someone became a friend. */
    FRIEND_ADDED,

    /** Social: someone reacted to one of the Explorer's Beats. */
    BEAT_REACTED,

    /** Social: a friend captured a Beat. */
    FRIEND_BEAT,

    /** Exploration: a new Place appeared near the Explorer. */
    PLACE_NEARBY
}
