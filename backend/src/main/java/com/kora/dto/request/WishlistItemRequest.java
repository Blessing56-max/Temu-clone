package com.kora.dto.request;
import jakarta.validation.constraints.NotNull;
public record WishlistItemRequest(@NotNull Long productId) {}