package com.planzip;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PlanzipApplicationTests {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    JdbcTemplate jdbcTemplate;

    @Test
    void healthChecksTheActualDatabase() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.service").value("plan.zip"))
                .andExpect(jsonPath("$.database").value("UP"));
    }

    @Test
    void unknownApiReturnsTheCommonErrorFormat() throws Exception {
        mockMvc.perform(get("/api/not-found"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("NOT_FOUND"))
                .andExpect(jsonPath("$.message").isNotEmpty())
                .andExpect(jsonPath("$.fieldErrors").isArray())
                .andExpect(jsonPath("$.traceId").isNotEmpty())
                .andExpect(header().exists("X-Trace-Id"));
    }

    @Test
    @Transactional
    void migrationAllowsAnEmptyPlanAndEnforcesOnePlanPerMember() {
        jdbcTemplate.update("INSERT INTO members (id) VALUES (101)");
        jdbcTemplate.update("""
                INSERT INTO local_credentials (member_id, normalized_email, password_hash)
                VALUES (101, 'first@example.com', 'test-hash')
                """);
        jdbcTemplate.update("INSERT INTO plans (id, owner_id) VALUES (201, 101)");

        assertThat(jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM bucket_items WHERE plan_id = 201", Integer.class)).isZero();
        assertThat(jdbcTemplate.queryForObject(
                "SELECT visibility FROM plans WHERE id = 201", String.class)).isEqualTo("PRIVATE");
        assertThatThrownBy(() -> jdbcTemplate.update(
                "INSERT INTO plans (owner_id) VALUES (101)")).isInstanceOf(DuplicateKeyException.class);
    }

    @Test
    @Transactional
    void migrationEnforcesUniqueLoginEmails() {
        jdbcTemplate.update("INSERT INTO members (id) VALUES (102), (103)");
        jdbcTemplate.update("""
                INSERT INTO local_credentials (member_id, normalized_email, password_hash)
                VALUES (102, 'duplicate@example.com', 'test-hash')
                """);

        assertThatThrownBy(() -> jdbcTemplate.update("""
                INSERT INTO local_credentials (member_id, normalized_email, password_hash)
                VALUES (103, 'duplicate@example.com', 'test-hash')
                """)).isInstanceOf(DuplicateKeyException.class);
    }
}
