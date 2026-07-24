package com.viego.identity.infrastructure.redis;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;

/**
 * Refresh-token rotation family (research R4): {@code identity:refresh:{familyId}} — the current
 * rotation handle (refresh JTI) + the access JTI issued alongside it + the owning Explorer.
 * Presenting a refresh token whose JTI doesn't match the family's current one means the token was
 * already superseded and is being replayed — reuse detection (FR-013) — which revokes the whole
 * family, not just the reused token. No TTL: durability over memory pressure, per ADR-0007.
 */
@Component
public class RefreshTokenRotationStore {

    private static final String KEY_PREFIX = "identity:refresh:";

    private final StringRedisTemplate redis;

    public RefreshTokenRotationStore(StringRedisTemplate redis) {
        this.redis = redis;
    }

    public void startFamily(String familyId, UUID explorerId, String refreshJti, String accessJti) {
        redis.opsForHash().putAll(key(familyId), Map.of(
                "explorerId", explorerId.toString(),
                "refreshJti", refreshJti,
                "accessJti", accessJti));
    }

    public enum Status { ROTATED, REUSE_DETECTED, NOT_FOUND }

    /** {@code previousAccessJti} is populated on both ROTATED and REUSE_DETECTED outcomes. */
    public record RotateOutcome(Status status, String previousAccessJti) {}

    public RotateOutcome rotate(String familyId, String presentedRefreshJti, String newRefreshJti, String newAccessJti) {
        String key = key(familyId);
        Object storedRefreshJti = redis.opsForHash().get(key, "refreshJti");
        if (storedRefreshJti == null) {
            return new RotateOutcome(Status.NOT_FOUND, null);
        }

        String previousAccessJti = (String) redis.opsForHash().get(key, "accessJti");
        if (!storedRefreshJti.equals(presentedRefreshJti)) {
            redis.delete(key); // reuse detected — the whole family is shut down, not just this token
            return new RotateOutcome(Status.REUSE_DETECTED, previousAccessJti);
        }

        redis.opsForHash().put(key, "refreshJti", newRefreshJti);
        redis.opsForHash().put(key, "accessJti", newAccessJti);
        return new RotateOutcome(Status.ROTATED, previousAccessJti);
    }

    private static String key(String familyId) {
        return KEY_PREFIX + familyId;
    }
}
