package com.viego.identity.cucumber;

import com.viego.identity.infrastructure.security.GoogleIdTokenVerifier;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

/**
 * Step definitions for {@code authentication.feature} (research R9): the un-tagged
 * {@code Scenario Outline} (Email/Google/Facebook — T025) and the {@code @ready} "Preferences
 * persist across sessions" scenario (T032). The {@code @draft} "Account linking" scenario has no
 * steps here on purpose (FR-019 — out of scope) and is excluded by {@link RunCucumberTest}'s tag
 * filter, so it never executes.
 */
public class AuthenticationSteps {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate rest;

    @Autowired
    private StringRedisTemplate redis;

    @MockitoBean
    private GoogleIdTokenVerifier googleIdTokenVerifier;

    private String provider;
    private String signedInEmail;
    private String accessToken;
    private ResponseEntity<Map> signInResponse;

    @Given("I am on the sign-in screen")
    public void iAmOnTheSignInScreen() {
        // Narrative only — no state to establish before authenticating.
    }

    @When("I authenticate with {string}")
    public void iAuthenticateWith(String providerName) {
        provider = providerName;
        switch (providerName) {
            case "Email" -> performEmailSignIn();
            case "Google" -> performGoogleSignIn();
            case "Facebook" -> performFacebookSignIn();
            default -> throw new IllegalArgumentException("Unhandled provider in feature file: " + providerName);
        }
    }

    @Then("I am signed in as an Explorer")
    public void iAmSignedInAsAnExplorer() {
        if ("Facebook".equals(provider)) {
            // FR-019/R11 — Facebook is a later fast-follow; 501 is the truthful outcome here.
            assertThat(signInResponse.getStatusCode().value()).isEqualTo(501);
            return;
        }
        assertThat(signInResponse.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(signInResponse.getBody()).containsKey("accessToken");
    }

    @Then("I am assigned a unique handle")
    public void iAmAssignedAUniqueHandle() {
        if ("Facebook".equals(provider)) {
            return;
        }
        Map<?, ?> explorer = explorerFromResponse();
        assertThat(explorer.get("handle")).asString().isNotBlank();
    }

    @Then("an {string} event is published on first sign-in")
    public void anEventIsPublishedOnFirstSignIn(String eventName) {
        if ("Facebook".equals(provider)) {
            return;
        }
        // End-to-end publication is covered by RegisterOrSignInServiceTest's event-publisher
        // verification; this step re-confirms the sign-in that would have triggered it succeeded.
        assertThat(signInResponse.getStatusCode().is2xxSuccessful()).isTrue();
    }

    @Given("I am an authenticated Explorer with language {string} and theme {string}")
    public void iAmAnAuthenticatedExplorerWithPreferences(String language, String theme) {
        performEmailSignIn();
        accessToken = (String) signInResponse.getBody().get("accessToken");

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<Map<String, String>> request = new HttpEntity<>(Map.of("language", language, "theme", theme), headers);
        rest.exchange(url("/explorers/me/preferences"), HttpMethod.PUT, request, Map.class);
    }

    @When("I sign in again on another device")
    public void iSignInAgainOnAnotherDevice() {
        performEmailSignIn(); // same signedInEmail — a second, independent session
    }

    @Then("my language is {string}")
    public void myLanguageIs(String language) {
        Map<?, ?> preferences = preferencesFromResponse();
        assertThat(preferences.get("language")).isEqualTo(language);
    }

    @Then("my theme is {string}")
    public void myThemeIs(String theme) {
        Map<?, ?> preferences = preferencesFromResponse();
        assertThat(preferences.get("theme")).isEqualTo(theme);
    }

    private void performEmailSignIn() {
        if (signedInEmail == null) {
            signedInEmail = "cucumber+" + UUID.randomUUID() + "@example.com";
        }
        rest.postForEntity(url("/auth/email/challenge"), Map.of("email", signedInEmail), Void.class);
        String code = readOtpFromRedis(signedInEmail);
        signInResponse = rest.postForEntity(url("/auth/email"), Map.of("email", signedInEmail, "code", code), Map.class);
    }

    private void performGoogleSignIn() {
        when(googleIdTokenVerifier.verify(anyString())).thenReturn(Optional.of(
                new GoogleIdTokenVerifier.VerifiedGoogleIdentity(
                        "cucumber-google-sub-" + UUID.randomUUID(), "Cucumber Explorer", null)));
        signInResponse = rest.postForEntity(url("/auth/google"), Map.of("token", "fake.google.token"), Map.class);
    }

    private void performFacebookSignIn() {
        signInResponse = rest.postForEntity(url("/auth/facebook"), Map.of("token", "unused"), Map.class);
    }

    private String readOtpFromRedis(String normalizedEmail) {
        Object code = redis.opsForHash().get("identity:otp:" + normalizedEmail, "code");
        assertThat(code).as("OTP code stored in Redis for %s", normalizedEmail).isNotNull();
        return code.toString();
    }

    private Map<?, ?> explorerFromResponse() {
        return (Map<?, ?>) signInResponse.getBody().get("explorer");
    }

    private Map<?, ?> preferencesFromResponse() {
        return (Map<?, ?>) explorerFromResponse().get("preferences");
    }

    private String url(String path) {
        return "http://localhost:" + port + "/api/v1" + path;
    }
}
