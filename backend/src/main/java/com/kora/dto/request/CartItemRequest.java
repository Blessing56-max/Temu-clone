package com.kora.dto.request;
import jakarta.validation.constraints.*;
public record CartItemRequest(
    @NotNull Long productId,
    @NotNull @Min(1) @Max(99) Integer quantity
) {}