package com.kora.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record ProductResponse(
    Long id,
    String name,
    String description,
    BigDecimal price,
    BigDecimal discountPrice,
    Integer stock,
    boolean active,
    Long sellerId,
    String sellerName,
    Long categoryId,
    String categoryName,
    List<ProductImageResponse> images,
    Instant createdAt,
    Instant updatedAt
) {}