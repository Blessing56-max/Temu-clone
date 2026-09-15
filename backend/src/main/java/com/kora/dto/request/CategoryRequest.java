package com.kora.dto.request;
import jakarta.validation.constraints.*;
public record CategoryRequest(
    @NotBlank @Size(max = 150) String name,
    Long parentId
) {}