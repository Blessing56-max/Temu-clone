package com.kora.repository;

import com.kora.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findBySellerId(Long sellerId, Pageable pageable);

    Page<Product> findByActiveTrue(Pageable pageable);

    Page<Product> findByActiveTrueAndCategoryId(Long categoryId, Pageable pageable);

    @Query(value = """
        SELECT * FROM products p
        WHERE p.active = true
          AND (:q IS NULL OR p.search_vector @@ plainto_tsquery('simple', :q))
          AND (:categoryId IS NULL OR p.category_id = :categoryId)
          AND (:minPrice IS NULL OR p.price >= :minPrice)
          AND (:maxPrice IS NULL OR p.price <= :maxPrice)
        ORDER BY
          CASE WHEN :q IS NULL THEN 0 ELSE ts_rank(p.search_vector, plainto_tsquery('simple', :q)) END DESC,
          p.created_at DESC
        """,
        countQuery = """
        SELECT count(*) FROM products p
        WHERE p.active = true
          AND (:q IS NULL OR p.search_vector @@ plainto_tsquery('simple', :q))
          AND (:categoryId IS NULL OR p.category_id = :categoryId)
          AND (:minPrice IS NULL OR p.price >= :minPrice)
          AND (:maxPrice IS NULL OR p.price <= :maxPrice)
        """,
        nativeQuery = true)
    Page<Product> search(@Param("q") String q,
                         @Param("categoryId") Long categoryId,
                         @Param("minPrice") java.math.BigDecimal minPrice,
                         @Param("maxPrice") java.math.BigDecimal maxPrice,
                         Pageable pageable);
}