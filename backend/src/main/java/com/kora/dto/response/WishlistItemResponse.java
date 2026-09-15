package com.kora.dto.response;
import java.math.BigDecimal;
public record WishlistItemResponse(
    Long id, Long productId, String productName, String imageUrl,
    BigDecimal price, BigDecimal discountPrice, boolean inStock
) {}