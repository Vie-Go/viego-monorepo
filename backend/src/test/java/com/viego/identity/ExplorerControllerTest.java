package com.viego.identity;

import com.viego.identity.application.UpdatePreferencesService;
import com.viego.identity.domain.Explorer;
import com.viego.identity.domain.Preferences;
import com.viego.identity.infrastructure.persistence.ExplorerRepository;
import com.viego.identity.infrastructure.persistence.PreferencesRepository;
import com.viego.identity.infrastructure.web.ExplorerController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.security.Principal;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * NFR-SEC-02: {@code me} is always resolved from the validated JWT's {@code sub} claim — there is
 * no path/query id an Explorer could substitute to read someone else's data. The principal is set
 * directly on the mock request (plain servlet API, {@code Principal}) rather than through Spring
 * Security's MockMvc integration, since {@code @WebMvcTest} doesn't reliably wire the full
 * security filter chain for a narrow controller slice.
 */
@WebMvcTest(ExplorerController.class)
class ExplorerControllerTest {

    @Autowired
    MockMvc mvc;

    @MockitoBean
    ExplorerRepository explorers;

    @MockitoBean
    PreferencesRepository preferences;

    @MockitoBean
    UpdatePreferencesService updatePreferencesService;

    private static Principal asExplorer(UUID explorerId) {
        Jwt jwt = Jwt.withTokenValue("test-token")
                .header("alg", "HS256")
                .claim("sub", explorerId.toString())
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(900))
                .build();
        return new JwtAuthenticationToken(jwt);
    }

    @Test
    void meReturnsTheAuthenticatedExplorerAndItsPreferences() throws Exception {
        UUID explorerId = UUID.randomUUID();
        when(explorers.findById(explorerId)).thenReturn(Optional.of(Explorer.builder()
                .id(explorerId)
                .handle("minh.dq")
                .displayName("Minh Dinh")
                .build()));
        when(preferences.findById(explorerId)).thenReturn(Optional.of(
                Preferences.builder().explorerId(explorerId).language("en").theme("dark").build()));

        mvc.perform(get("/api/v1/explorers/me").principal(asExplorer(explorerId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.handle").value("minh.dq"))
                .andExpect(jsonPath("$.preferences.language").value("en"))
                .andExpect(jsonPath("$.preferences.theme").value("dark"));
    }

    @Test
    void preferencesRoundTripThroughPut() throws Exception {
        UUID explorerId = UUID.randomUUID();
        when(updatePreferencesService.update(explorerId, "vi", "dark")).thenReturn(
                Preferences.builder().explorerId(explorerId).language("vi").theme("dark").build());

        mvc.perform(put("/api/v1/explorers/me/preferences")
                        .principal(asExplorer(explorerId))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"language\":\"vi\",\"theme\":\"dark\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.language").value("vi"))
                .andExpect(jsonPath("$.theme").value("dark"));
    }

    @Test
    void aRequestCanOnlyEverResolveItsOwnSubjectNeverAnotherExplorers() throws Exception {
        UUID subjectWithNoExplorerRow = UUID.randomUUID();
        // This JWT's own subject doesn't resolve to an Explorer — proving there is no other id
        // (path/query) this request could substitute to reach someone else's account instead.
        when(explorers.findById(subjectWithNoExplorerRow)).thenReturn(Optional.empty());

        mvc.perform(get("/api/v1/explorers/me").principal(asExplorer(subjectWithNoExplorerRow)))
                .andExpect(status().isNotFound());
    }
}
