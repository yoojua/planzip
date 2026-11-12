package com.planzip.shared.health;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
class HealthController {

    private final JdbcTemplate jdbcTemplate;

    HealthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/api/health")
    HealthResponse health() {
        jdbcTemplate.queryForObject("SELECT 1", Integer.class);
        return new HealthResponse("UP", "plan.zip", "UP", "첫 API 연결 확인");
    }

    record HealthResponse(String status, String service, String database, String message) {
    }
}
