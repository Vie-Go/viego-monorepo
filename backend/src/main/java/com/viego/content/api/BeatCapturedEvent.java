package com.viego.content.api;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

/**
 * Domain Event emitted when an Explorer captures a new Beat (photo check-in).
 * Cross-module backbone event consumed by Exploration (unlocks), Engagement (streaks), and Social (feed).
 */
public record BeatCapturedEvent(
        UUID beatId,          // content.beats(id) — UUIDv7
        UUID explorerId,      // identity.explorers(id) — UUIDv7
        UUID placeId,         // exploration.places(id) — UUIDv7
        String provinceId,    // Exploration ISO Code e.g. VN-HN
        String mediaUrl,
        Instant capturedAt
) implements Serializable {}
