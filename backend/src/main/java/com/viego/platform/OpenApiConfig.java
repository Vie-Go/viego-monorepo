package com.viego.platform;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * springdoc metadata for the auto-generated OpenAPI document (FR-007).
 */
@Configuration
public class OpenApiConfig {

	@Bean
	OpenAPI vieGoOpenAPI(@org.springframework.beans.factory.annotation.Value("${viego.version:0.0.0}") String version) {
		return new OpenAPI().info(new Info()
				.title("VieGo Platform API")
				.version(version)
				.description("Phase 0 walking skeleton — non-domain platform endpoints. "
						+ "Product contexts (identity/exploration/engagement/content) are empty skeletons."));
	}
}
