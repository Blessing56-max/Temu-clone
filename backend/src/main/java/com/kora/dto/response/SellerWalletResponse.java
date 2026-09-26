package com.kora.dto.response;

import java.math.BigDecimal;

public record SellerWalletResponse(
    BigDecimal availableBalance,      // RELEASED payouts minus pending withdrawals
    BigDecimal pendingEscrow,         // money still HELD (order not delivered)
    BigDecimal totalEarned,           // lifetime released payouts
    BigDecimal pendingWithdrawals,    // withdrawals in PENDING or PROCESSING
    BigDecimal minimumWithdrawal,
    int commissionPercent             // 15
) {}