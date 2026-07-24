package com.viego.identity.infrastructure.web;

import com.viego.identity.application.EmailChallengeService;
import com.viego.identity.application.RefreshTokenService;
import com.viego.identity.application.RegisterOrSignInService;
import com.viego.identity.domain.Explorer;
import com.viego.identity.domain.Preferences;
import com.viego.identity.infrastructure.persistence.ExplorerRepository;
import com.viego.identity.infrastructure.persistence.PreferencesRepository;
import com.viego.identity.infrastructure.security.GoogleIdTokenVerifier;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;
import java.util.UUID;

/**
 * Sign-in surface: {@code POST /auth/email/challenge} (a code, not a session — R10),
 * {@code POST /auth/{provider}} (email → verified code; google → verified OIDC ID token;
 * facebook/zalo → {@code 501}, R11), {@code POST /auth/refresh} (rotation with reuse detection,
 * FR-013). Public — no Bearer token required (NFR-SEC-01's exemption for auth itself), matching
 * {@link com.viego.identity.infrastructure.security.SecurityConfig}'s {@code permitAll} on
 * {@code /api/v1/auth/**}.
 */
@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "identity", description = "Explorer accounts, handles, auth, preferences")
public class AuthController {

    private final EmailChallengeService emailChallengeService;
    private final GoogleIdTokenVerifier googleIdTokenVerifier;
    private final RegisterOrSignInService registerOrSignIn;
    private final RefreshTokenService refreshTokenService;
    private final ExplorerRepository explorers;
    private final PreferencesRepository preferencesRepository;

    public AuthController(
            EmailChallengeService emailChallengeService,
            GoogleIdTokenVerifier googleIdTokenVerifier,
            RegisterOrSignInService registerOrSignIn,
            RefreshTokenService refreshTokenService,
            ExplorerRepository explorers,
            PreferencesRepository preferencesRepository) {
        this.emailChallengeService = emailChallengeService;
        this.googleIdTokenVerifier = googleIdTokenVerifier;
        this.registerOrSignIn = registerOrSignIn;
        this.refreshTokenService = refreshTokenService;
        this.explorers = explorers;
        this.preferencesRepository = preferencesRepository;
    }

    @PostMapping("/email/challenge")
    @ResponseStatus(HttpStatus.ACCEPTED)
    @Operation(summary = "Send a one-time sign-in code to an email address")
    public void requestEmailChallenge(@Valid @RequestBody EmailChallengeRequest request) {
        emailChallengeService.requestChallenge(request.email());
    }

    @PostMapping("/{provider}")
    @Operation(summary = "Exchange a provider token (or, for email, a challenge code) for a VieGo session")
    public ResponseEntity<?> signIn(@PathVariable String provider, @RequestBody SignInRequest request) {
        return switch (provider) {
            case "email" -> signInWithEmail(request);
            case "google" -> signInWithGoogle(request);
            case "facebook", "zalo" -> ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
            default -> ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
        };
    }

    @PostMapping("/refresh")
    @Operation(summary = "Rotate the access token (refresh-token rotation with reuse detection)")
    public ResponseEntity<?> refresh(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        String presentedToken = bearerToken(authorizationHeader);
        if (presentedToken == null) {
            return refreshRejected();
        }

        Optional<RefreshTokenService.SessionTokens> rotated = refreshTokenService.rotate(presentedToken);
        if (rotated.isEmpty()) {
            return refreshRejected();
        }

        RefreshTokenService.SessionTokens tokens = rotated.get();
        Optional<Explorer> explorer = explorers.findById(tokens.explorerId());
        if (explorer.isEmpty()) {
            return refreshRejected();
        }
        Preferences prefs = preferencesRepository.findById(tokens.explorerId())
                .orElseThrow(() -> new IllegalStateException("Explorer " + tokens.explorerId() + " has no Preferences row"));
        return ResponseEntity.ok(new Session(tokens.accessToken(), tokens.refreshToken(), toExplorerResponse(explorer.get(), prefs)));
    }

    private ResponseEntity<?> signInWithEmail(SignInRequest request) {
        if (request.email() == null || request.code() == null
                || !emailChallengeService.verify(request.email(), request.code())) {
            return invalidCredential();
        }
        String normalizedEmail = EmailChallengeService.normalize(request.email());
        String localPart = normalizedEmail.substring(0, Math.max(normalizedEmail.indexOf('@'), 0));
        Explorer explorer = registerOrSignIn.registerOrSignIn(
                new RegisterOrSignInService.Identity("email", normalizedEmail, localPart, null));
        return ResponseEntity.ok(toSession(explorer));
    }

    private ResponseEntity<?> signInWithGoogle(SignInRequest request) {
        if (request.token() == null) {
            return invalidCredential();
        }
        Optional<GoogleIdTokenVerifier.VerifiedGoogleIdentity> verified = googleIdTokenVerifier.verify(request.token());
        if (verified.isEmpty()) {
            return invalidCredential();
        }
        GoogleIdTokenVerifier.VerifiedGoogleIdentity identity = verified.get();
        Explorer explorer = registerOrSignIn.registerOrSignIn(new RegisterOrSignInService.Identity(
                "google", identity.subject(), identity.displayName(), identity.avatarUrl()));
        return ResponseEntity.ok(toSession(explorer));
    }

    private ResponseEntity<ProblemDetail> invalidCredential() {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST, "Invalid, expired, or tampered credential"));
    }

    private ResponseEntity<ProblemDetail> refreshRejected() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ProblemDetail.forStatusAndDetail(
                HttpStatus.UNAUTHORIZED, "Reused or invalid refresh token"));
    }

    private static String bearerToken(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return null;
        }
        return authorizationHeader.substring("Bearer ".length());
    }

    private Session toSession(Explorer explorer) {
        RefreshTokenService.SessionTokens tokens = refreshTokenService.issueInitialSession(explorer.getId());
        Preferences prefs = preferencesRepository.findById(explorer.getId())
                .orElseThrow(() -> new IllegalStateException("Explorer " + explorer.getId() + " has no Preferences row"));
        return new Session(tokens.accessToken(), tokens.refreshToken(), toExplorerResponse(explorer, prefs));
    }

    private static ExplorerResponse toExplorerResponse(Explorer explorer, Preferences prefs) {
        return new ExplorerResponse(
                explorer.getId(),
                explorer.getHandle(),
                explorer.getDisplayName(),
                null,
                new PreferencesResponse(prefs.getLanguage(), prefs.getTheme()));
    }
}
