package com.kora.repository;

import com.kora.entity.Withdrawal;
import com.kora.entity.WithdrawalStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;

public interface WithdrawalRepository extends JpaRepository<Withdrawal, Long> {
    Page<Withdrawal> findBySellerIdOrderByRequestedAtDesc(Long sellerId, Pageable pageable);
    Page<Withdrawal> findByStatusOrderByRequestedAtAsc(WithdrawalStatus status, Pageable pageable);

    @Query("""
        SELECT COALESCE(SUM(w.amount), 0) FROM Withdrawal w
        WHERE w.seller.id = :sellerId
          AND w.status IN ('PENDING', 'PROCESSING')
    """)
    BigDecimal sumPendingBySeller(@Param("sellerId") Long sellerId);
}