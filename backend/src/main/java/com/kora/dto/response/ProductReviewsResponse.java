package com.kora.dto.response;
import java.util.List;
public record ProductReviewsResponse(
    Long productId,
    Double averageRating,
    long totalReviews,
    List<ReviewResponse> reviews
) {}