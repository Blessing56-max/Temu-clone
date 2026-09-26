package com.kora.dto.response;

import com.kora.entity.WithdrawalStatus;

import java.math.BigDecimal;
import java.time.Instant;

public record WithdrawalResponse(
    Long id,
    BigDecimal amount,
    WithdrawalStatus status,
    String sellerName,
    String sellerEmail,
    String paystackTransferCode,
    String paystackReference,
    String failureReason,
    Instant requestedAt,
    Instant completedAt
) {}