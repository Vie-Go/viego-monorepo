package com.viego.content.api;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

/**
 * Domain Event emitted when an Explorer captures a new Beat (photo check-in).
 * Cross-module backbone event consumed by Exploration (unlocks), Engagement (streaks), and Social (feed).
 */
public record BeatCapturedEvent(
        Long beatId,          // TSID (64-bit BIGINT)
        UUID explorerId,      // Identity UUID (16 bytes)
        Long placeId,         // Exploration TSID (64-bit BIGINT)
        String provinceId,    // Exploration ISO Code e.g. VN-HN
        String mediaUrl,
        Instant capturedAt
) implements Serializable {}
