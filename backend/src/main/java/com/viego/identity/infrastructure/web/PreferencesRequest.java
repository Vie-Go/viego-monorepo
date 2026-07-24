package com.viego.identity.infrastructure.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record PreferencesRequest(
        @NotBlank @Pattern(regexp = "vi|en|ko|ja|fr") String language,
        @NotBlank @Pattern(regexp = "light|dark") String theme) {}
