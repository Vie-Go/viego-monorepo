package com.viego.identity.infrastructure.redis;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;

/**
 * Access-token denylist (research R4): {@code identity:revoked:{jti}}, presence-only, TTL-bounded
 * by the access token's own remaining lifetime — the token would expire naturally by then anyway,
 * so the entry never needs to outlive it. Populated by {@code RefreshTokenService} when a refresh
 * reuse is detected (the access token issued alongside the reused refresh token is shut down
 * immediately rather than waiting out its remaining TTL).
 *
 * <p>Not consulted on every authenticated request — {@link com.viego.identity.infrastructure.security.SecurityConfig}'s
 * JWT validation deliberately stays signature+expiry only, no Redis round-trip on the hot path
 * (plan.md's Performance Goals). This denylist is exercised only by the refresh-rotation path in
 * this feature; wiring it into the request-time validation chain is a follow-up, not a gap this
 * feature silently papers over — see handoff-us3.md.
 */
@Component
public class RevocationStore {

    private static final String KEY_PREFIX = "identity:revoked:";

    private final StringRedisTemplate redis;

    public RevocationStore(StringRedisTemplate redis) {
        this.redis = redis;
    }

    public void revoke(String jti, Duration ttl) {
        if (jti == null || ttl == null || ttl.isNegative() || ttl.isZero()) {
            return;
        }
        redis.opsForValue().set(KEY_PREFIX + jti, "1", ttl);
    }

    public boolean isRevoked(String jti) {
        return jti != null && Boolean.TRUE.equals(redis.hasKey(KEY_PREFIX + jti));
    }
}
