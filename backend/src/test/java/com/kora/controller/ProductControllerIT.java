package com.kora.controller;

import com.kora.entity.Role;
import com.kora.entity.User;
import com.kora.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Testcontainers
class ProductControllerIT {

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
    @Autowired UserRepository userRepository;
    @Autowired PasswordEncoder passwordEncoder;
    @LocalServerPort int port;

    @BeforeEach
    void seedSeller() {
        if (userRepository.findByEmail("itseller@kora.test").isEmpty()) {
            userRepository.save(User.builder()
                    .email("itseller@kora.test")
                    .passwordHash(passwordEncoder.encode("Password123!"))
                    .fullName("IT Seller")
                    .role(Role.SELLER)
                    .emailVerified(true)
                    .enabled(true)
                    .build());
        }
    }

    @Test
    void sellerCreatesProduct_publicSearchFindsIt() {
        String base = "http://localhost:" + port;

        // Login as seller
        var login = Map.of("email", "itseller@kora.test", "password", "Password123!");
        ResponseEntity<Map> loginRes = rest.postForEntity(base + "/api/auth/login", login, Map.class);
        assertThat(loginRes.getStatusCode()).isEqualTo(HttpStatus.OK);
        String token = (String) loginRes.getBody().get("accessToken");

        // Create product
        HttpHeaders h = new HttpHeaders();
        h.setBearerAuth(token);
        h.setContentType(MediaType.APPLICATION_JSON);

        var product = Map.of(
                "name", "IT Test Widget",
                "description", "A widget for testing",
                "price", 1000,
                "stock", 5,
                "imageUrls", List.of("https://img.test/widget.jpg"),
                "active", true
        );

        ResponseEntity<Map> createRes = rest.exchange(base + "/api/products",
                HttpMethod.POST, new HttpEntity<>(product, h), Map.class);
        assertThat(createRes.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(createRes.getBody().get("name")).isEqualTo("IT Test Widget");

        // Search publicly (no auth)
        ResponseEntity<Map> searchRes = rest.getForEntity(base + "/api/products?q=widget", Map.class);
        assertThat(searchRes.getStatusCode()).isEqualTo(HttpStatus.OK);
        var content = (List<?>) searchRes.getBody().get("content");
        assertThat(content).isNotEmpty();
    }

    @Test
    void anonymousCannotCreateProduct() {
        String base = "http://localhost:" + port;
        var product = Map.of("name", "X", "price", 100, "stock", 1);

        ResponseEntity<Map> res = rest.postForEntity(base + "/api/products", product, Map.class);
        assertThat(res.getStatusCode().is4xxClientError()).isTrue();
    }
}