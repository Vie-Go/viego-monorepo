package com.viego.identity.infrastructure.security;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jwt.SignedJWT;
import com.nimbusds.oauth2.sdk.id.ClientID;
import com.nimbusds.oauth2.sdk.id.Issuer;
import com.nimbusds.openid.connect.sdk.claims.IDTokenClaimsSet;
import com.nimbusds.openid.connect.sdk.validators.IDTokenValidator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.URL;
import java.util.Optional;

/**
 * Verifies a Google-issued OIDC ID token as a relying party (research R2): signature against
 * Google's published JWKS, {@code iss}, {@code aud} (this app's Google OAuth client id), and
 * {@code exp}. The verified {@code sub} claim becomes {@code AuthProvider.providerSubjectId} for
 * {@code kind=google}.
 */
@Component
public class GoogleIdTokenVerifier {

    private static final Issuer GOOGLE_ISSUER = new Issuer("https://accounts.google.com");
    private static final String GOOGLE_JWK_SET_URL = "https://www.googleapis.com/oauth2/v3/certs";

    private final IDTokenValidator validator;

    public GoogleIdTokenVerifier(@Value("${viego.google.oauth-client-id}") String googleClientId) {
        try {
            this.validator = new IDTokenValidator(
                    GOOGLE_ISSUER,
                    new ClientID(googleClientId),
                    JWSAlgorithm.RS256,
                    new URL(GOOGLE_JWK_SET_URL));
        } catch (java.net.MalformedURLException e) {
            throw new IllegalStateException("Google JWKS URL is malformed", e);
        }
    }

    public record VerifiedGoogleIdentity(String subject, String displayName, String avatarUrl) {}

    /** Empty if the token's signature, issuer, audience, or expiry fail verification. */
    public Optional<VerifiedGoogleIdentity> verify(String idToken) {
        try {
            SignedJWT jwt = SignedJWT.parse(idToken);
            IDTokenClaimsSet claims = validator.validate(jwt, null);
            URI picture = claims.getURIClaim("picture");
            return Optional.of(new VerifiedGoogleIdentity(
                    claims.getSubject().getValue(),
                    claims.getStringClaim("name"),
                    picture != null ? picture.toString() : null));
        } catch (Exception e) {
            return Optional.empty();
        }
    }
}
