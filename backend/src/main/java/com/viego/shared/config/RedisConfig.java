package com.viego.shared.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;

/**
 * Redis connectivity for identity's ephemeral, non-system-of-record data (refresh-token
 * rotation, revocation, rate limiting, email OTP challenges) — see ADR-0007 and data-model.md.
 * The {@link RedisConnectionFactory} itself is Spring Boot's own auto-configuration (driven by
 * {@code spring.data.redis.url}, set from {@code REDIS_URL}); this class only adds the
 * string-keyed template every identity Redis adapter uses, alongside the existing
 * {@link DatabaseConfig}/{@link FlywayConfig}.
 */
@Configuration
public class RedisConfig {

    @Bean
    public StringRedisTemplate stringRedisTemplate(RedisConnectionFactory connectionFactory) {
        return new StringRedisTemplate(connectionFactory);
    }
}
