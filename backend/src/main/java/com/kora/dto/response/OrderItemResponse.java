package com.kora.dto.response;
import java.math.BigDecimal;
public record OrderItemResponse(
    Long id, Long productId, String productName, String imageUrl,
    BigDecimal unitPrice, Integer quantity, BigDecimal lineTotal,
    Long sellerId, String sellerName
) {}