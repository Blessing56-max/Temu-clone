package com.kora.dto.response;

import com.kora.entity.Role;

import java.time.Instant;

public record UserResponse(
        Long id,
        String email,
        String fullName,
        String phone,
        Role role,
        boolean emailVerified,
        Instant createdAt
) {}