package com.viego.platform;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Contract check for {@code GET /api/v1/status} (FR-006/FR-007), matching
 * {@code contracts/platform.openapi.yaml}. Web-layer only — no database.
 */
@WebMvcTest(StatusController.class)
class StatusControllerTest {

	@Autowired
	MockMvc mvc;

	@Test
	void returnsUpStatusWithServiceAndTime() throws Exception {
		mvc.perform(get("/api/v1/status"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value("UP"))
				.andExpect(jsonPath("$.service").exists())
				.andExpect(jsonPath("$.time").exists());
	}
}
