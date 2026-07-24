package com.viego.engagement.api;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

/**
 * Domain event emitted when an Explorer's streak crosses a milestone and a badge is awarded
 * (FR-EN-07). Consumed by Notification to tell the Explorer, and by Social to surface the badge.
 */
public record MilestoneReachedEvent(
        UUID explorerId,
        int milestone,
        String badgeCode,
        Instant reachedAt
) implements Serializable {}
