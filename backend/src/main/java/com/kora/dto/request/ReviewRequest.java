package com.kora.dto.request;
import jakarta.validation.constraints.*;
public record ReviewRequest(
    @NotNull Long productId,
    @NotNull @Min(1) @Max(5) Integer rating,
    @Size(max = 2000) String comment
) {}