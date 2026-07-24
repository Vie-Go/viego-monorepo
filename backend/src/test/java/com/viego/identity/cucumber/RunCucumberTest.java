package com.viego.identity.cucumber;

import org.junit.platform.suite.api.ConfigurationParameter;
import org.junit.platform.suite.api.IncludeEngines;
import org.junit.platform.suite.api.SelectClasspathResource;
import org.junit.platform.suite.api.Suite;

import static io.cucumber.junit.platform.engine.Constants.FILTER_TAGS_PROPERTY_NAME;
import static io.cucumber.junit.platform.engine.Constants.GLUE_PROPERTY_NAME;
import static io.cucumber.junit.platform.engine.Constants.PLUGIN_PROPERTY_NAME;

/**
 * Executes {@code authentication.feature} directly from its canonical location (copied onto the
 * test classpath by the {@code testResources} entry in pom.xml — research R9). Only the
 * un-tagged {@code Scenario Outline} and the {@code @ready} scenario gate CI; {@code @draft}
 * ("Account linking across providers") has no step definitions on purpose (FR-019 — out of
 * scope) and must never execute.
 */
@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features/identity/authentication.feature")
@ConfigurationParameter(key = GLUE_PROPERTY_NAME, value = "com.viego.identity.cucumber")
@ConfigurationParameter(key = FILTER_TAGS_PROPERTY_NAME, value = "not @draft")
@ConfigurationParameter(key = PLUGIN_PROPERTY_NAME, value = "pretty, summary")
public class RunCucumberTest {
}
