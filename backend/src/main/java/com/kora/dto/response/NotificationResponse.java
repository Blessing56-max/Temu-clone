package com.kora.dto.response;
import java.time.Instant;
public record NotificationResponse(
    Long id, String type, String title, String message,
    String link, boolean read, Instant createdAt
) {}