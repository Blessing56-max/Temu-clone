package com.kora.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Testcontainers
class AuthControllerIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("kora_test")
            .withUsername("kora")
            .withPassword("kora_test");

    @DynamicPropertySource
    static void props(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url", postgres::getJdbcUrl);
        r.add("spring.datasource.username", postgres::getUsername);
        r.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired TestRestTemplate rest;
    @LocalServerPort int port;

    @Test
    void register_thenLogin_thenMe() {
        String base = "http://localhost:" + port;

        // Health is public
        ResponseEntity<String> health = rest.getForEntity(base + "/api/health", String.class);
        assertThat(health.getStatusCode()).isEqualTo(HttpStatus.OK);

        // Register
        var register = Map.of(
                "email", "it@kora.test",
                "password", "Password123!",
                "fullName", "IT User",
                "phone", "+234801"
        );
        ResponseEntity<Map> regRes = rest.postForEntity(base + "/api/auth/register", register, Map.class);
        assertThat(regRes.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(regRes.getBody()).containsKey("accessToken");
        assertThat(regRes.getBody()).containsKey("refreshToken");

        // Login
        var login = Map.of("email", "it@kora.test", "password", "Password123!");
        ResponseEntity<Map> loginRes = rest.postForEntity(base + "/api/auth/login", login, Map.class);
        assertThat(loginRes.getStatusCode()).isEqualTo(HttpStatus.OK);
        String token = (String) loginRes.getBody().get("accessToken");

        // /me with token
        HttpHeaders h = new HttpHeaders();
        h.setBearerAuth(token);
        ResponseEntity<Map> meRes = rest.exchange(base + "/api/auth/me",
                HttpMethod.GET, new HttpEntity<>(h), Map.class);
        assertThat(meRes.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(meRes.getBody().get("email")).isEqualTo("it@kora.test");

        // /me without token — should be 401 or 403
        ResponseEntity<String> unauth = rest.getForEntity(base + "/api/auth/me", String.class);
        assertThat(unauth.getStatusCode().is4xxClientError()).isTrue();
    }

    @Test
    void duplicateRegistration_conflicts() {
        String base = "http://localhost:" + port;
        var reg = Map.of(
                "email", "dup@kora.test",
                "password", "Password123!",
                "fullName", "Dup"
        );
        ResponseEntity<Map> first = rest.postForEntity(base + "/api/auth/register", reg, Map.class);
        assertThat(first.getStatusCode()).isEqualTo(HttpStatus.CREATED);

        ResponseEntity<Map> second = rest.postForEntity(base + "/api/auth/register", reg, Map.class);
        assertThat(second.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }
}