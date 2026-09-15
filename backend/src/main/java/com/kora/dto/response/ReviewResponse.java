package com.kora.dto.response;
import java.time.Instant;
public record ReviewResponse(
    Long id, Long productId, Long userId, String userName,
    Integer rating, String comment, Instant createdAt
) {}