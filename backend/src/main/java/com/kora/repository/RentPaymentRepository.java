package com.kora.repository;

import com.kora.entity.RentPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RentPaymentRepository extends JpaRepository<RentPayment, Long> {
    List<RentPayment> findBySellerIdOrderByPeriodStartDesc(Long sellerId);
    Optional<RentPayment> findFirstBySellerIdAndStatusOrderByPeriodEndDesc(Long sellerId, String status);
}