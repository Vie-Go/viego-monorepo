package com.viego.identity.infrastructure.web;

/**
 * {@code token} is required for google/facebook/zalo; {@code email}/{@code code} are required
 * for {@code provider=email} (research R10 — additive fields on the existing sign-in request).
 */
public record SignInRequest(String token, String email, String code) {}
