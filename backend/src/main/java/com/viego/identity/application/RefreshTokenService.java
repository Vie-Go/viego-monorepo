package com.viego.identity.application;

import com.viego.identity.infrastructure.redis.RefreshTokenRotationStore;
import com.viego.identity.infrastructure.redis.RevocationStore;
import com.viego.identity.infrastructure.security.JwtService;
import io.jsonwebtoken.Claims;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

/**
 * Issues the initial access+refresh pair at sign-in (seeding a rotation family) and rotates a
 * refresh token on each renewal, detecting reuse of an already-superseded token (FR-013,
 * research R4). On reuse, the whole family is shut down — not just the replayed token — and the
 * access token issued alongside it is denylisted rather than left to expire naturally.
 */
@Service
public class RefreshTokenService {

    private final JwtService jwtService;
    private final RefreshTokenRotationStore rotationStore;
    private final RevocationStore revocationStore;

    public RefreshTokenService(JwtService jwtService, RefreshTokenRotationStore rotationStore, RevocationStore revocationStore) {
        this.jwtService = jwtService;
        this.rotationStore = rotationStore;
        this.revocationStore = revocationStore;
    }

    public record SessionTokens(String accessToken, String refreshToken, UUID explorerId) {}

    public SessionTokens issueInitialSession(UUID explorerId) {
        String familyId = UUID.randomUUID().toString();
        JwtService.IssuedToken access = jwtService.issueAccessToken(explorerId);
        JwtService.IssuedToken refresh = jwtService.issueRefreshToken(explorerId, familyId);
        rotationStore.startFamily(familyId, explorerId, refresh.jti(), access.jti());
        return new SessionTokens(access.token(), refresh.token(), explorerId);
    }

    /** Empty means "reject with 401" — either the token doesn't validate, or reuse was detected. */
    public Optional<SessionTokens> rotate(String presentedRefreshToken) {
        var validated = jwtService.validate(presentedRefreshToken);
        if (validated.isEmpty()) {
            return Optional.empty();
        }

        Claims claims = validated.get().getPayload();
        String familyId = claims.get("fid", String.class);
        String presentedJti = claims.getId();
        if (familyId == null || presentedJti == null) {
            return Optional.empty();
        }
        UUID explorerId = UUID.fromString(claims.getSubject());

        JwtService.IssuedToken newAccess = jwtService.issueAccessToken(explorerId);
        JwtService.IssuedToken newRefresh = jwtService.issueRefreshToken(explorerId, familyId);

        RefreshTokenRotationStore.RotateOutcome outcome =
                rotationStore.rotate(familyId, presentedJti, newRefresh.jti(), newAccess.jti());

        if (outcome.status() == RefreshTokenRotationStore.Status.REUSE_DETECTED) {
            revocationStore.revoke(outcome.previousAccessJti(), jwtService.accessTokenTtl());
            return Optional.empty();
        }
        if (outcome.status() == RefreshTokenRotationStore.Status.NOT_FOUND) {
            return Optional.empty();
        }

        return Optional.of(new SessionTokens(newAccess.token(), newRefresh.token(), explorerId));
    }
}
