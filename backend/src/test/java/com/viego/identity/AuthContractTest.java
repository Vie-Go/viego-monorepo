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
import org.hamcrest.Matchers;
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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Asserts a successful {@code POST /auth/{provider}} response matches
 * contracts/rest-api.identity.openapi.yaml's {@code Session} schema exactly: accessToken,
 * refreshToken, explorer.{id, handle, displayName, homeProvince, preferences.{language, theme}}.
 */
@WebMvcTest(AuthController.class)
class AuthContractTest {

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

    private final ObjectMapper json = new ObjectMapper();

    @BeforeEach
    @SuppressWarnings("unchecked")
    void stubRateLimiterRedisOps() {
        ValueOperations<String, String> valueOps = mock(ValueOperations.class);
        when(stringRedisTemplate.opsForValue()).thenReturn(valueOps);
    }

    @Test
    void signInResponseMatchesTheSessionSchema() throws Exception {
        UUID explorerId = UUID.randomUUID();
        when(emailChallengeService.verify(anyString(), anyString())).thenReturn(true);
        when(registerOrSignInService.registerOrSignIn(any())).thenReturn(Explorer.builder()
                .id(explorerId)
                .handle("minh.dq")
                .displayName("Minh Dinh")
                .build());
        when(refreshTokenService.issueInitialSession(explorerId))
                .thenReturn(new RefreshTokenService.SessionTokens("access.jwt.token", "refresh.jwt.token", explorerId));
        when(preferencesRepository.findById(explorerId))
                .thenReturn(Optional.of(Preferences.builder().explorerId(explorerId).build()));

        mvc.perform(post("/api/v1/auth/email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(new SignInBody(null, "explorer@example.com", "123456"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("access.jwt.token"))
                .andExpect(jsonPath("$.refreshToken").value("refresh.jwt.token"))
                .andExpect(jsonPath("$.explorer.id").value(explorerId.toString()))
                .andExpect(jsonPath("$.explorer.handle").value("minh.dq"))
                .andExpect(jsonPath("$.explorer.displayName").value("Minh Dinh"))
                .andExpect(jsonPath("$.explorer.homeProvince").value(Matchers.nullValue()))
                .andExpect(jsonPath("$.explorer.preferences.language").value("vi"))
                .andExpect(jsonPath("$.explorer.preferences.theme").value("light"));
    }

    private record SignInBody(String token, String email, String code) {}
}
