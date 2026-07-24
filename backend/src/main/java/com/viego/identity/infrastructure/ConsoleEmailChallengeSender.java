package com.viego.identity.infrastructure;

import com.viego.identity.application.EmailChallengeSender;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * This feature's dev-only exit (research R3): logs the code instead of emailing it — selected
 * explicitly via {@code EMAIL_CHALLENGE_SENDER=console} (the local default). Never the sender for
 * any other configured value; T053 audits that OTP codes aren't logged outside this one path.
 */
@Component
@ConditionalOnProperty(name = "viego.email.challenge-sender", havingValue = "console", matchIfMissing = true)
public class ConsoleEmailChallengeSender implements EmailChallengeSender {

    private static final Logger log = LoggerFactory.getLogger(ConsoleEmailChallengeSender.class);

    @Override
    public void send(String normalizedEmail, String code) {
        log.info("Email challenge code for {}: {}", normalizedEmail, code);
    }
}
