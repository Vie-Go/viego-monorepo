package com.viego.shared.config;

import org.flywaydb.core.Flyway;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

/**
 * Spring configuration providing one Flyway bean per module schema.
 * Each Flyway bean manages migration execution and history independently within its schema namespace
 * (identity.flyway_schema_history, exploration.flyway_schema_history, etc.), so a module can be
 * extracted to its own database without splitting migration history.
 */
@Configuration
public class FlywayConfig {

    @Bean
    public Flyway identityFlyway(DataSource dataSource) {
        Flyway flyway = Flyway.configure()
                .dataSource(dataSource)
                .schemas("identity")
                .defaultSchema("identity")
                .locations("classpath:db/migration/identity")
                .table("flyway_schema_history")
                .load();
        flyway.migrate();
        return flyway;
    }

    @Bean
    public Flyway explorationFlyway(DataSource dataSource) {
        Flyway flyway = Flyway.configure()
                .dataSource(dataSource)
                .schemas("exploration")
                .defaultSchema("exploration")
                .locations("classpath:db/migration/exploration")
                .table("flyway_schema_history")
                .load();
        flyway.migrate();
        return flyway;
    }

    @Bean
    public Flyway contentFlyway(DataSource dataSource) {
        Flyway flyway = Flyway.configure()
                .dataSource(dataSource)
                .schemas("content")
                .defaultSchema("content")
                .locations("classpath:db/migration/content")
                .table("flyway_schema_history")
                .load();
        flyway.migrate();
        return flyway;
    }

    @Bean
    public Flyway engagementFlyway(DataSource dataSource) {
        Flyway flyway = Flyway.configure()
                .dataSource(dataSource)
                .schemas("engagement")
                .defaultSchema("engagement")
                .locations("classpath:db/migration/engagement")
                .table("flyway_schema_history")
                .load();
        flyway.migrate();
        return flyway;
    }

    @Bean
    public Flyway socialFlyway(DataSource dataSource) {
        Flyway flyway = Flyway.configure()
                .dataSource(dataSource)
                .schemas("social")
                .defaultSchema("social")
                .locations("classpath:db/migration/social")
                .table("flyway_schema_history")
                .load();
        flyway.migrate();
        return flyway;
    }

    @Bean
    public Flyway notificationFlyway(DataSource dataSource) {
        Flyway flyway = Flyway.configure()
                .dataSource(dataSource)
                .schemas("notification")
                .defaultSchema("notification")
                .locations("classpath:db/migration/notification")
                .table("flyway_schema_history")
                .load();
        flyway.migrate();
        return flyway;
    }

    @Bean
    public Flyway publicFlyway(DataSource dataSource) {
        Flyway flyway = Flyway.configure()
                .dataSource(dataSource)
                .schemas("public")
                .defaultSchema("public")
                .locations("classpath:db/migration/public")
                .table("flyway_schema_history")
                .load();
        flyway.migrate();
        return flyway;
    }
}
