package com.kora.dto.response;
import java.math.BigDecimal;
public record CartItemResponse(
    Long id, Long productId, String productName, String imageUrl,
    BigDecimal price, BigDecimal discountPrice, Integer quantity,
    BigDecimal lineTotal, Integer stock
) {}