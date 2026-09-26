package com.kora.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record WithdrawalRequest(
    @NotNull
    @DecimalMin(value = "5000.0", message = "Minimum withdrawal is N5,000")
    BigDecimal amount
) {}