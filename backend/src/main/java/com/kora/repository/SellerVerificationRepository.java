package com.kora.repository;

import com.kora.entity.KycStatus;
import com.kora.entity.SellerVerification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SellerVerificationRepository extends JpaRepository<SellerVerification, Long> {
    Optional<SellerVerification> findBySellerId(Long sellerId);
    boolean existsBySellerId(Long sellerId);
    Page<SellerVerification> findByStatusOrderByCreatedAtAsc(KycStatus status, Pageable pageable);
    long countByStatus(KycStatus status);
}