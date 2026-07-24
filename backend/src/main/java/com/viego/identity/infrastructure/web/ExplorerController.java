package com.viego.identity.infrastructure.web;

import com.viego.identity.application.UpdatePreferencesService;
import com.viego.identity.domain.Explorer;
import com.viego.identity.domain.Preferences;
import com.viego.identity.infrastructure.persistence.ExplorerRepository;
import com.viego.identity.infrastructure.persistence.PreferencesRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

/**
 * {@code me}-scoped Explorer reads/writes (NFR-SEC-02) — the authenticated identity comes only
 * from the validated JWT's {@code sub} claim, never a path or query id, so one Explorer can never
 * read or write another's data via this controller.
 */
@RestController
@RequestMapping("/api/v1/explorers")
@Tag(name = "identity", description = "Explorer accounts, handles, auth, preferences")
public class ExplorerController {

    private final ExplorerRepository explorers;
    private final PreferencesRepository preferences;
    private final UpdatePreferencesService updatePreferencesService;

    public ExplorerController(
            ExplorerRepository explorers,
            PreferencesRepository preferences,
            UpdatePreferencesService updatePreferencesService) {
        this.explorers = explorers;
        this.preferences = preferences;
        this.updatePreferencesService = updatePreferencesService;
    }

    @GetMapping("/me")
    @Operation(summary = "Get the authenticated Explorer")
    public ExplorerResponse me(Authentication authentication) {
        UUID explorerId = explorerIdFrom(authentication);
        Explorer explorer = explorers.findById(explorerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Explorer not found"));
        Preferences prefs = preferences.findById(explorerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Preferences not found"));
        return toResponse(explorer, prefs);
    }

    @PutMapping("/me/preferences")
    @Operation(summary = "Update language/theme preferences (emits PreferencesUpdated)")
    public PreferencesResponse updateMyPreferences(Authentication authentication, @Valid @RequestBody PreferencesRequest request) {
        UUID explorerId = explorerIdFrom(authentication);
        Preferences updated = updatePreferencesService.update(explorerId, request.language(), request.theme());
        return new PreferencesResponse(updated.getLanguage(), updated.getTheme());
    }

    /** {@code me} always comes from the validated JWT's {@code sub} — never a path/query id. */
    private static UUID explorerIdFrom(Authentication authentication) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        return UUID.fromString(jwt.getSubject());
    }

    private static ExplorerResponse toResponse(Explorer explorer, Preferences prefs) {
        return new ExplorerResponse(
                explorer.getId(),
                explorer.getHandle(),
                explorer.getDisplayName(),
                null,
                new PreferencesResponse(prefs.getLanguage(), prefs.getTheme()));
    }
}
