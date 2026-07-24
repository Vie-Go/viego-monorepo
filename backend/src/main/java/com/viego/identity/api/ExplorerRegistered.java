package com.viego.identity.api;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

/**
 * Published exactly once per Explorer, at creation — never on a repeat sign-in (FR-006). Peers
 * that need to know an Explorer exists learn it from this event, never from a join into
 * {@code identity.*} (Module Boundary Rules).
 */
public record ExplorerRegistered(UUID explorerId, String handle, Instant at) implements Serializable {}
