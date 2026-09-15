package com.kora.repository;

import com.kora.entity.OrderItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    Page<OrderItem> findBySellerId(Long sellerId, Pageable pageable);

    @Query("""
        SELECT COUNT(oi) > 0 FROM OrderItem oi
        JOIN oi.order o
        WHERE o.user.id = :userId AND oi.product.id = :productId
          AND o.status = 'DELIVERED'
    """)
    boolean userHasPurchasedDelivered(@Param("userId") Long userId,
                                      @Param("productId") Long productId);

    // Total revenue for seller (only PAID onwards)
    @Query("""
        SELECT COALESCE(SUM(oi.lineTotal), 0)
        FROM OrderItem oi
        WHERE oi.seller.id = :sellerId
          AND oi.order.status NOT IN ('PENDING', 'CANCELLED')
    """)
    BigDecimal totalRevenueBySeller(@Param("sellerId") Long sellerId);

    // Count distinct orders for seller
    @Query("""
        SELECT COUNT(DISTINCT oi.order.id)
        FROM OrderItem oi
        WHERE oi.seller.id = :sellerId
          AND oi.order.status NOT IN ('PENDING', 'CANCELLED')
    """)
    long totalOrdersBySeller(@Param("sellerId") Long sellerId);

    // Count total units sold
    @Query("""
        SELECT COALESCE(SUM(oi.quantity), 0)
        FROM OrderItem oi
        WHERE oi.seller.id = :sellerId
          AND oi.order.status NOT IN ('PENDING', 'CANCELLED')
    """)
    long totalUnitsSoldBySeller(@Param("sellerId") Long sellerId);

    // Top selling products (by units)
    @Query("""
        SELECT oi.product.id, oi.productName, SUM(oi.quantity), SUM(oi.lineTotal)
        FROM OrderItem oi
        WHERE oi.seller.id = :sellerId
          AND oi.order.status NOT IN ('PENDING', 'CANCELLED')
        GROUP BY oi.product.id, oi.productName
        ORDER BY SUM(oi.quantity) DESC
        """)
    List<Object[]> topSellingBySeller(@Param("sellerId") Long sellerId, Pageable pageable);

    // Monthly revenue (last 6 months)
    @Query(value = """
        SELECT TO_CHAR(oi.order_id_created_month, 'YYYY-MM') AS month,
               SUM(oi.line_total) AS revenue
        FROM (
            SELECT oi.line_total, DATE_TRUNC('month', o.created_at) AS order_id_created_month
            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            WHERE oi.seller_id = :sellerId
              AND o.status NOT IN ('PENDING', 'CANCELLED')
              AND o.created_at >= NOW() - INTERVAL '6 months'
        ) AS oi
        GROUP BY oi.order_id_created_month
        ORDER BY oi.order_id_created_month
        """, nativeQuery = true)
    List<Object[]> monthlyRevenueBySeller(@Param("sellerId") Long sellerId);
}