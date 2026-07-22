package com.viego.platform;

import java.time.OffsetDateTime;

/**
 * Trivial, non-domain application status — the resource the mobile app reads to prove
 * end-to-end connectivity (Phase 0 walking skeleton). Carries no personal data.
 *
 * @param status  overall app health (UP / DOWN)
 * @param service constant service identifier
 * @param version build/git version
 * @param time    server time of the check
 */
public record Status(String status, String service, String version, OffsetDateTime time) {

	public static Status up(String service, String version) {
		return new Status("UP", service, version, OffsetDateTime.now());
	}
}
