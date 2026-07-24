package com.viego.identity;

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
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;
import java.util.UUID;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Web-layer only: {@code POST /auth/refresh} returns {@code 200} + a new {@code Session} on a
 * successful rotation, and {@code 401} whenever {@link RefreshTokenService#rotate} reports reuse
 * or an invalid token (FR-013) — the actual reuse-detection logic itself is covered by
 * {@code RefreshTokenServiceTest} against real Redis.
 */
@WebMvcTest(AuthController.class)
class AuthRefreshControllerTest {

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

    @MockitoBean
    StringRedisTemplate stringRedisTemplate;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void stubRateLimiterRedisOps() {
        ValueOperations<String, String> valueOps = mock(ValueOperations.class);
        when(stringRedisTemplate.opsForValue()).thenReturn(valueOps);
    }

    @Test
    void missingAuthorizationHeaderIsRejected() throws Exception {
        mvc.perform(post("/api/v1/auth/refresh"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void reusedOrInvalidRefreshTokenIsRejected() throws Exception {
        when(refreshTokenService.rotate("superseded.refresh.token")).thenReturn(Optional.empty());

        mvc.perform(post("/api/v1/auth/refresh").header("Authorization", "Bearer superseded.refresh.token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void successfulRotationReturnsANewSession() throws Exception {
        UUID explorerId = UUID.randomUUID();
        when(refreshTokenService.rotate("old.refresh.token")).thenReturn(Optional.of(
                new RefreshTokenService.SessionTokens("new.access.token", "new.refresh.token", explorerId)));
        when(explorerRepository.findById(explorerId)).thenReturn(Optional.of(Explorer.builder()
                .id(explorerId)
                .handle("minh.dq")
                .displayName("Minh Dinh")
                .build()));
        when(preferencesRepository.findById(explorerId))
                .thenReturn(Optional.of(Preferences.builder().explorerId(explorerId).build()));

        mvc.perform(post("/api/v1/auth/refresh").header("Authorization", "Bearer old.refresh.token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("new.access.token"))
                .andExpect(jsonPath("$.refreshToken").value("new.refresh.token"));
    }
}
