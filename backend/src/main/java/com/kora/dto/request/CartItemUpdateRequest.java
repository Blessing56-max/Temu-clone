package com.kora.dto.request;
import jakarta.validation.constraints.*;
public record CartItemUpdateRequest(
    @NotNull @Min(1) @Max(99) Integer quantity
) {}