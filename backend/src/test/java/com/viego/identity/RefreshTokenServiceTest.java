package com.viego.identity;

import com.redis.testcontainers.RedisContainer;
import com.viego.identity.application.RefreshTokenService;
import com.viego.identity.infrastructure.redis.RefreshTokenRotationStore;
import com.viego.identity.infrastructure.redis.RevocationStore;
import com.viego.identity.infrastructure.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration test (real Redis, Testcontainers — research R4): successful rotation, then reuse of
 * the superseded token revokes the whole family — the *new* token from the successful rotation
 * also stops working, proving the family (not just the reused token) was shut down (FR-013).
 *
 * <p>Requires Docker; not runnable in this dev sandbox (see handoff-us1.md's Verification
 * section) — run in CI or a Docker-capable environment before merging.
 */
@Testcontainers
class RefreshTokenServiceTest {

    @Container
    static RedisContainer redis = new RedisContainer(DockerImageName.parse("redis:7-alpine"));

    private RefreshTokenService service;

    @BeforeEach
    void setUp() {
        LettuceConnectionFactory connectionFactory = new LettuceConnectionFactory(
                new RedisStandaloneConfiguration(redis.getRedisHost(), redis.getRedisPort()));
        connectionFactory.afterPropertiesSet();
        StringRedisTemplate redisTemplate = new StringRedisTemplate(connectionFactory);

        JwtService jwtService = new JwtService(
                "test-only-signing-secret-at-least-32-bytes-long", "PT15M", "P30D");
        service = new RefreshTokenService(
                jwtService,
                new RefreshTokenRotationStore(redisTemplate),
                new RevocationStore(redisTemplate));
    }

    @Test
    void successfulRotationThenReplayOfSupersededTokenRevokesTheWholeFamily() {
        UUID explorerId = UUID.randomUUID();
        RefreshTokenService.SessionTokens initial = service.issueInitialSession(explorerId);

        Optional<RefreshTokenService.SessionTokens> rotated = service.rotate(initial.refreshToken());
        assertThat(rotated).isPresent();
        String newRefreshToken = rotated.get().refreshToken();
        assertThat(newRefreshToken).isNotEqualTo(initial.refreshToken());

        // Replay the superseded (original) refresh token.
        assertThat(service.rotate(initial.refreshToken())).isEmpty();

        // The new token from the successful rotation above must also now fail.
        assertThat(service.rotate(newRefreshToken)).isEmpty();
    }

    @Test
    void anInvalidTokenIsRejectedWithoutTouchingAnyFamily() {
        assertThat(service.rotate("not-a-real-jwt")).isEmpty();
    }
}
