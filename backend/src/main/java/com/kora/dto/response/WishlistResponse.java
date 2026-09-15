package com.kora.dto.response;
import java.util.List;
public record WishlistResponse(Long id, List<WishlistItemResponse> items, Integer totalItems) {}