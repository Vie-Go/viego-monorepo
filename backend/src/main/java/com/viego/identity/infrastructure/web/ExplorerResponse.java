package com.viego.identity.infrastructure.web;

import java.util.UUID;

/** {@code homeProvince} is always null at this feature — populated by Exploration (P2). */
public record ExplorerResponse(
        UUID id,
        String handle,
        String displayName,
        String homeProvince,
        PreferencesResponse preferences) {}
