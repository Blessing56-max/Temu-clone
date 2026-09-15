package com.kora.repository;

import com.kora.entity.ProductView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductViewRepository extends JpaRepository<ProductView, Long> {

    @Query("SELECT COUNT(pv) FROM ProductView pv WHERE pv.product.id = :productId")
    long countByProductId(@Param("productId") Long productId);

    @Query("""
        SELECT pv.product.id, pv.product.name, COUNT(pv) as views
        FROM ProductView pv
        WHERE pv.product.seller.id = :sellerId
        GROUP BY pv.product.id, pv.product.name
        ORDER BY views DESC
        """)
    List<Object[]> topViewedBySeller(@Param("sellerId") Long sellerId);
}