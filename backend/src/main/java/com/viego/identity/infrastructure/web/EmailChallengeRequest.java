package com.viego.identity.infrastructure.web;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record EmailChallengeRequest(@NotBlank @Email String email) {}
