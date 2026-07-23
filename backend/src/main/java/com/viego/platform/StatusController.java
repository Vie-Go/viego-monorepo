package com.viego.platform;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Non-domain platform endpoint backing the walking skeleton's connectivity check.
 * Contract: {@code contracts/platform.openapi.yaml} ({@code operationId: getStatus}).
 */
@RestController
@RequestMapping("/api/v1")
@Tag(name = "Platform", description = "Non-domain platform endpoints")
public class StatusController {

	private final String serviceName;
	private final String version;

	public StatusController(
			@Value("${spring.application.name:viego-backend}") String serviceName,
			@Value("${viego.version:0.0.0}") String version) {
		this.serviceName = serviceName;
		this.version = version;
	}

	@GetMapping("/status")
	@Operation(summary = "Trivial application status (the app's connectivity check)")
	public Status status() {
		return Status.up(serviceName, version);
	}
}
