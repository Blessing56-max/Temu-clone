package com.kora.dto.response;

import java.math.BigDecimal;

public record AdminStatsResponse(
    long totalUsers,
    long totalCustomers,
    long totalSellers,
    long totalAdmins,
    long totalProducts,
    long activeProducts,
    long totalOrders,
    long pendingOrders,
    long deliveredOrders,
    BigDecimal totalRevenue,
    long totalReviews,
    long totalProductViews
) {}