package com.viego.identity;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.viego.identity.application.EmailChallengeService;
import com.viego.identity.application.RefreshTokenService;
import com.viego.identity.application.RegisterOrSignInService;
import com.viego.identity.domain.Explorer;
import com.viego.identity.domain.Preferences;
import com.viego.identity.infrastructure.persistence.ExplorerRepository;
import com.viego.identity.infrastructure.persistence.PreferencesRepository;
import com.viego.identity.infrastructure.security.GoogleIdTokenVerifier;
import com.viego.identity.infrastructure.web.AuthController;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Web-layer only (FR-005): invalid/expired/tampered credentials never issue a session;
 * unsupported providers return 501 (R11) — no database, no real token verification.
 */
@WebMvcTest(AuthController.class)
class AuthControllerTest {

    @Autowired
    MockMvc mvc;

    @MockitoBean
    EmailChallengeService emailChallengeService;

    @MockitoBean
    GoogleIdTokenVerifier googleIdTokenVerifier;

    @MockitoBean
    RegisterOrSignInService registerOrSignInService;

    @MockitoBean
    RefreshTokenService refreshTokenService;

    @MockitoBean
    ExplorerRepository explorerRepository;

    @MockitoBean
    PreferencesRepository preferencesRepository;

    // AuthRateLimiter is a WebMvcConfigurer/HandlerInterceptor, so @WebMvcTest picks it up even
    // though the test is scoped to AuthController — it needs a StringRedisTemplate to construct.
    @MockitoBean
    StringRedisTemplate stringRedisTemplate;

    private final ObjectMapper json = new ObjectMapper();

    @BeforeEach
    @SuppressWarnings("unchecked")
    void stubRateLimiterRedisOps() {
        ValueOperations<String, String> valueOps = mock(ValueOperations.class);
        when(stringRedisTemplate.opsForValue()).thenReturn(valueOps);
    }

    @Test
    void emailChallengeIsAccepted() throws Exception {
        mvc.perform(post("/api/v1/auth/email/challenge")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(new EmailChallengeBody("explorer@example.com"))))
                .andExpect(status().isAccepted());
    }

    @Test
    void invalidEmailCodeIsRejectedWithNoSession() throws Exception {
        when(emailChallengeService.verify(anyString(), anyString())).thenReturn(false);

        mvc.perform(post("/api/v1/auth/email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(new SignInBody(null, "explorer@example.com", "000000"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void tamperedGoogleTokenIsRejectedWithNoSession() throws Exception {
        when(googleIdTokenVerifier.verify(anyString())).thenReturn(Optional.empty());

        mvc.perform(post("/api/v1/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(new SignInBody("tampered.jwt.token", null, null))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void validEmailCodeSignsIn() throws Exception {
        UUID explorerId = UUID.randomUUID();
        when(emailChallengeService.verify(anyString(), anyString())).thenReturn(true);
        when(registerOrSignInService.registerOrSignIn(any())).thenReturn(Explorer.builder()
                .id(explorerId)
                .handle("explorer1")
                .displayName("explorer")
                .build());
        when(refreshTokenService.issueInitialSession(explorerId))
                .thenReturn(new RefreshTokenService.SessionTokens("access.jwt", "refresh.jwt", explorerId));
        when(preferencesRepository.findById(explorerId))
                .thenReturn(Optional.of(Preferences.builder().explorerId(explorerId).build()));

        mvc.perform(post("/api/v1/auth/email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(new SignInBody(null, "explorer@example.com", "123456"))))
                .andExpect(status().isOk());
    }

    @Test
    void unsupportedProviderReturns501() throws Exception {
        mvc.perform(post("/api/v1/auth/facebook")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(new SignInBody("some.token", null, null))))
                .andExpect(status().isNotImplemented());
    }

    private record EmailChallengeBody(String email) {}

    private record SignInBody(String token, String email, String code) {}
}
