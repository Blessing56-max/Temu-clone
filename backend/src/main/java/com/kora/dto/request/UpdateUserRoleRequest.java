package com.kora.dto.request;
import com.kora.entity.Role;
import jakarta.validation.constraints.NotNull;
public record UpdateUserRoleRequest(@NotNull Role role) {}