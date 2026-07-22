package com.viego;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * VieGo backend — a Spring Boot 4 modular monolith (Spring Modulith).
 *
 * <p>Phase 0 walking skeleton: five empty bounded-context modules
 * ({@code identity}, {@code exploration}, {@code engagement}, {@code content}, {@code shared})
 * plus a non-domain {@code platform} status endpoint. Module boundaries are enforced by
 * {@code ModulithVerificationTest} from the first commit.
 */
@SpringBootApplication
public class VieGoApplication {

	public static void main(String[] args) {
		SpringApplication.run(VieGoApplication.class, args);
	}

}
