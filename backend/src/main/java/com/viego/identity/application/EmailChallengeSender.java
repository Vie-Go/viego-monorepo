package com.viego.identity.application;

/**
 * Port for delivering an email one-time sign-in code (research R3). Swapping in a real
 * transactional-email provider later is a one-class change against this interface — no
 * email-delivery ADR exists yet, so picking a provider is deliberately out of this feature's
 * scope.
 */
public interface EmailChallengeSender {

    void send(String normalizedEmail, String code);
}
