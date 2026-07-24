package com.viego.identity.api;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

/**
 * Published on every successful preference change (FR-009). ADR-0007 names this as the trigger
 * to evict a cached {@code me} read model — no such cache exists yet at this feature.
 */
public record PreferencesUpdated(UUID explorerId, String language, String theme, Instant at) implements Serializable {}
