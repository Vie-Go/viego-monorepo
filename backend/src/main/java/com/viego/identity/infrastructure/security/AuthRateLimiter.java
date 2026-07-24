package com.viego.identity.infrastructure.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.time.Duration;

/**
 * Fixed-window rate limiter guarding {@code /api/v1/auth/*} (FR-016, NFR-SEC-07):
 * {@code identity:ratelimit:{ip}:{route}}, {@code INCR}+{@code EXPIRE} (research R4). Registers
 * itself as a {@link WebMvcConfigurer} so this stays a single file, matching the task's file path.
 *
 * <p>Depends on {@link StringRedisTemplate} via {@link ObjectProvider} rather than a direct
 * constructor dependency: {@code @WebMvcTest} slices include any {@code WebMvcConfigurer}/
 * {@code HandlerInterceptor} bean regardless of which controller the slice targets (a documented
 * Spring Boot test-slice behavior), so a hard dependency here would fail bean creation for every
 * unrelated {@code @WebMvcTest} in the app, not just identity's own. Resolving the template lazily
 * lets a Redis-less slice fall through to "allow" instead of failing to start.
 */
@Configuration
public class AuthRateLimiter implements HandlerInterceptor, WebMvcConfigurer {

    private static final Duration WINDOW = Duration.ofMinutes(1);
    private static final long MAX_REQUESTS_PER_WINDOW = 20;

    private final ObjectProvider<StringRedisTemplate> redisProvider;

    public AuthRateLimiter(ObjectProvider<StringRedisTemplate> redisProvider) {
        this.redisProvider = redisProvider;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(this).addPathPatterns("/api/v1/auth/**");
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        StringRedisTemplate redis = redisProvider.getIfAvailable();
        if (redis == null) {
            return true;
        }

        String key = "identity:ratelimit:%s:%s".formatted(request.getRemoteAddr(), request.getRequestURI());
        Long count = redis.opsForValue().increment(key);
        if (count != null && count == 1L) {
            redis.expire(key, WINDOW);
        }
        if (count != null && count > MAX_REQUESTS_PER_WINDOW) {
            response.setStatus(429);
            response.setContentType("application/problem+json");
            response.getWriter().write(
                    "{\"title\":\"Too Many Requests\",\"status\":429,\"detail\":\"Rate limit exceeded for this route\"}");
            return false;
        }
        return true;
    }
}
