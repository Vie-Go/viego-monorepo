package com.viego.shared;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration Test for Multi-Schema Isolation and Hybrid Key Architecture.
 * Verifies:
 * 1. 5 separate Flyway schema history tables exist (identity, exploration, content, engagement, social).
 * 2. 0 cross-schema foreign key constraints exist across the database.
 */
@SpringBootTest
@ActiveProfiles("test")
public class SchemaIsolationTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void testFiveSeparateFlywayHistoryTablesExist() {
        String sql = """
            SELECT table_schema 
            FROM information_schema.tables 
            WHERE table_name = 'flyway_schema_history' 
              AND table_schema IN ('identity', 'exploration', 'content', 'engagement', 'social')
        """;
        List<String> schemas = jdbcTemplate.queryForList(sql, String.class);
        assertThat(schemas).containsExactlyInAnyOrder("identity", "exploration", "content", "engagement", "social");
    }

    @Test
    void testZeroCrossSchemaForeignKeysExist() {
        String sql = """
            SELECT
                tc.table_schema, 
                tc.constraint_name, 
                tc.table_name, 
                ccu.table_schema AS foreign_table_schema,
                ccu.table_name AS foreign_table_name
            FROM 
                information_schema.table_constraints AS tc 
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
                  AND ccu.table_schema != tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY'
        """;
        List<Map<String, Object>> crossSchemaFks = jdbcTemplate.queryForList(sql);
        assertThat(crossSchemaFks)
                .withFailMessage("Cross-schema foreign keys detected: %s", crossSchemaFks)
                .isEmpty();
    }
}
