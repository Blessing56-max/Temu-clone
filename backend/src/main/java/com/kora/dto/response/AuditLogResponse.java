package com.kora.dto.response;
import java.time.Instant;
public record AuditLogResponse(
    Long id, String actorEmail, String action,
    String targetType, Long targetId, String metadata, Instant createdAt
) {}