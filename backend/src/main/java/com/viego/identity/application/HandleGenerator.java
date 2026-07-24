package com.viego.identity.application;

import com.viego.identity.infrastructure.persistence.ExplorerRepository;
import org.springframework.stereotype.Component;

import java.util.Locale;

/**
 * Derives a unique handle from a display name or email local-part (research R5): lowercase,
 * strip non {@code [a-z0-9._]} characters, truncate to fit {@code explorers.handle VARCHAR(32)},
 * then check-and-retry with a numeric suffix. The column's {@code UNIQUE} constraint is the
 * backstop that makes a collision impossible to miss; this generation just avoids ever hitting it
 * in the common case.
 */
@Component
public class HandleGenerator {

    private static final int MAX_LENGTH = 32;
    private static final String FALLBACK = "explorer";

    private final ExplorerRepository explorers;

    public HandleGenerator(ExplorerRepository explorers) {
        this.explorers = explorers;
    }

    public String generate(String seed) {
        String base = sanitize(seed);
        if (base.isEmpty()) {
            base = FALLBACK;
        }

        String candidate = truncate(base, 0);
        int suffix = 1;
        while (explorers.existsByHandle(candidate)) {
            suffix++;
            String suffixText = String.valueOf(suffix);
            candidate = truncate(base, suffixText.length()) + suffixText;
        }
        return candidate;
    }

    private static String sanitize(String seed) {
        if (seed == null) {
            return "";
        }
        return seed.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9._]", "");
    }

    private static String truncate(String base, int reserveForSuffix) {
        int max = MAX_LENGTH - reserveForSuffix;
        return base.length() > max ? base.substring(0, max) : base;
    }
}
