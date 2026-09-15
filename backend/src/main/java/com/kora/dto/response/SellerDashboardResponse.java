package com.kora.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record SellerDashboardResponse(
    Long sellerId,
    String storeName,
    // Overview
    BigDecimal totalRevenue,
    long totalOrders,
    long totalUnitsSold,
    long totalProducts,
    long totalReviews,
    Double averageRating,
    // Lists
    List<ProductStat> topSellingProducts,
    List<ProductStat> topViewedProducts,
    List<MonthlyRevenue> monthlyRevenue
) {
    public record ProductStat(
        Long productId,
        String productName,
        long unitsSold,
        BigDecimal revenue,
        long views
    ) {}

    public record MonthlyRevenue(String month, BigDecimal revenue) {}
}