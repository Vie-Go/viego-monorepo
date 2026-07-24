package com.viego.identity.infrastructure.redis;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.time.Duration;

/**
 * Redis-backed one-time email sign-in code (research R3): {@code identity:otp:{normalizedEmail}}
 * — never a system of record, losing one just makes an in-flight sign-in re-request a code.
 */
@Component
public class EmailChallengeStore {

    private static final String KEY_PREFIX = "identity:otp:";
    private static final Duration TTL = Duration.ofMinutes(10);
    private static final int MAX_ATTEMPTS = 5;

    private final StringRedisTemplate redis;
    private final SecureRandom random = new SecureRandom();

    public EmailChallengeStore(StringRedisTemplate redis) {
        this.redis = redis;
    }

    /** Generates, stores, and returns a fresh 6-digit code, resetting any prior attempt count. */
    public String issue(String normalizedEmail) {
        String code = String.format("%06d", random.nextInt(1_000_000));
        String key = key(normalizedEmail);
        redis.opsForHash().put(key, "code", code);
        redis.opsForHash().put(key, "attempts", "0");
        redis.expire(key, TTL);
        return code;
    }

    public enum VerifyResult { VALID, INVALID, EXPIRED_OR_ABSENT, ATTEMPTS_EXCEEDED }

    /** One-time use: a VALID or ATTEMPTS_EXCEEDED result consumes the challenge. */
    public VerifyResult verify(String normalizedEmail, String submittedCode) {
        String key = key(normalizedEmail);
        Object storedCode = redis.opsForHash().get(key, "code");
        if (storedCode == null) {
            return VerifyResult.EXPIRED_OR_ABSENT;
        }

        Long attempts = redis.opsForHash().increment(key, "attempts", 1);
        if (attempts != null && attempts > MAX_ATTEMPTS) {
            redis.delete(key);
            return VerifyResult.ATTEMPTS_EXCEEDED;
        }

        if (!storedCode.equals(submittedCode)) {
            return VerifyResult.INVALID;
        }

        redis.delete(key);
        return VerifyResult.VALID;
    }

    private static String key(String normalizedEmail) {
        return KEY_PREFIX + normalizedEmail;
    }
}
