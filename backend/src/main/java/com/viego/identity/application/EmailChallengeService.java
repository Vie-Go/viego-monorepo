package com.viego.identity.application;

import com.viego.identity.infrastructure.redis.EmailChallengeStore;
import org.springframework.stereotype.Service;

import java.util.Locale;

/**
 * Orchestrates the passwordless email flow (research R3): issue a code via
 * {@link EmailChallengeStore}/{@link EmailChallengeSender}; verify a submitted code, feeding a
 * verified email into {@link RegisterOrSignInService} as the {@code email} provider identity.
 */
@Service
public class EmailChallengeService {

    private final EmailChallengeStore store;
    private final EmailChallengeSender sender;

    public EmailChallengeService(EmailChallengeStore store, EmailChallengeSender sender) {
        this.store = store;
        this.sender = sender;
    }

    public void requestChallenge(String email) {
        String normalized = normalize(email);
        String code = store.issue(normalized);
        sender.send(normalized, code);
    }

    public boolean verify(String email, String code) {
        String normalized = normalize(email);
        return store.verify(normalized, code) == EmailChallengeStore.VerifyResult.VALID;
    }

    public static String normalize(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }
}
