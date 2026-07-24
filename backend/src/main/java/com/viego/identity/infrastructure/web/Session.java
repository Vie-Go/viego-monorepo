package com.viego.identity.infrastructure.web;

public record Session(String accessToken, String refreshToken, ExplorerResponse explorer) {}
