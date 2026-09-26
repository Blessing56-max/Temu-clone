package com.kora.repository;

import com.kora.entity.EscrowStatus;
import com.kora.entity.EscrowTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface EscrowTransactionRepository extends JpaRepository<EscrowTransaction, Long> {
    List<EscrowTransaction> findByOrderId(Long orderId);
    List<EscrowTransaction> findBySellerIdAndStatus(Long sellerId, EscrowStatus status);

    @Query("""
        SELECT COALESCE(SUM(e.sellerPayout), 0)
        FROM EscrowTransaction e
        WHERE e.seller.id = :sellerId AND e.status = :status
    """)
    BigDecimal sumPayoutBySellerAndStatus(@Param("sellerId") Long sellerId,
                                          @Param("status") EscrowStatus status);

    @Query("""
        SELECT COUNT(e) > 0 FROM EscrowTransaction e
        WHERE e.seller.id = :sellerId AND e.status = 'HELD'
    """)
    boolean sellerHasHeldFunds(@Param("sellerId") Long sellerId);
}