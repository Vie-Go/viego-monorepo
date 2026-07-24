package com.viego.identity.infrastructure.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Issues and validates VieGo's self-issued HS256 access/refresh JWTs (research R1). VieGo is
 * the only party that ever mints or reads these tokens, so a shared HMAC secret (no external
 * key distribution) is sufficient — see research.md R1 for why asymmetric signing is deferred.
 */
@Service
public class JwtService {

    private final SecretKey signingKey;
    private final Duration accessTokenTtl;
    private final Duration refreshTokenTtl;

    public JwtService(
            @Value("${viego.security.jwt-signing-secret}") String signingSecret,
            @Value("${viego.security.access-token-ttl}") String accessTokenTtl,
            @Value("${viego.security.refresh-token-ttl}") String refreshTokenTtl) {
        // A deterministic key derived from the configured secret (not a freshly generated one) —
        // tokens must remain valid across app restarts.
        this.signingKey = io.jsonwebtoken.security.Keys.hmacShaKeyFor(normalizeSecret(signingSecret));
        this.accessTokenTtl = Duration.parse(accessTokenTtl);
        this.refreshTokenTtl = Duration.parse(refreshTokenTtl);
    }

    /** HS256 requires a >= 256-bit key; pad a shorter dev secret rather than fail at boot. */
    private static byte[] normalizeSecret(String secret) {
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length >= 32) {
            return bytes;
        }
        byte[] padded = new byte[32];
        for (int i = 0; i < 32; i++) {
            padded[i] = bytes[i % bytes.length];
        }
        return padded;
    }

    public record IssuedToken(String token, String jti, Instant expiresAt) {}

    public IssuedToken issueAccessToken(UUID explorerId) {
        return issue(explorerId, accessTokenTtl, Map.of());
    }

    /** {@code familyId} rides in the {@code fid} claim — how a rotation looks up its Redis family (US3). */
    public IssuedToken issueRefreshToken(UUID explorerId, String familyId) {
        return issue(explorerId, refreshTokenTtl, Map.of("fid", familyId));
    }

    private IssuedToken issue(UUID explorerId, Duration ttl, Map<String, Object> extraClaims) {
        String jti = UUID.randomUUID().toString();
        Instant now = Instant.now();
        Instant expiresAt = now.plus(ttl);
        var builder = Jwts.builder()
                .subject(explorerId.toString())
                .id(jti)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiresAt))
                .claims(extraClaims);
        String token = builder.signWith(signingKey, Jwts.SIG.HS256).compact();
        return new IssuedToken(token, jti, expiresAt);
    }

    /** Validates signature and expiry only; caller decides revocation (Redis denylist, US3). */
    public Optional<Jws<Claims>> validate(String token) {
        try {
            return Optional.of(Jwts.parser().verifyWith(signingKey).build().parseSignedClaims(token));
        } catch (JwtException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }

    public SecretKey signingKey() {
        return signingKey;
    }

    public Duration accessTokenTtl() {
        return accessTokenTtl;
    }
}
