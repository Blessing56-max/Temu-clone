package com.kora.dto.response;

import com.kora.entity.RentStatus;

import java.math.BigDecimal;
import java.time.Instant;

public record RentStatusResponse(
    RentStatus status,
    Instant paidUntil,
    long daysLeft,
    BigDecimal monthlyAmount,
    int graceDays
) {}