package com.kora.service;

import com.kora.dto.response.SellerWalletResponse;
import com.kora.entity.*;
import com.kora.exception.ApiException;
import com.kora.repository.EscrowTransactionRepository;
import com.kora.repository.UserRepository;
import com.kora.repository.WithdrawalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class SellerWalletService {

    public static final BigDecimal COMMISSION_RATE = new BigDecimal("0.15");
    public static final BigDecimal MIN_WITHDRAWAL = new BigDecimal("5000.00");

    private final EscrowTransactionRepository escrowRepository;
    private final WithdrawalRepository withdrawalRepository;
    private final UserRepository userRepository;

    // ---------------- CREATE ESCROW (called when order is paid) ----------------
    @Transactional
    public void createEscrowForOrder(Order order) {
        // Idempotency: skip if escrow already exists for this order
        if (!escrowRepository.findByOrderId(order.getId()).isEmpty()) {
            log.warn("Escrow already exists for order {} — skipping", order.getId());
            return;
        }

        // One escrow row per unique seller in this order
        Map<Long, BigDecimal> totalsBySeller = new HashMap<>();
        Map<Long, User> sellers = new HashMap<>();
        for (OrderItem item : order.getItems()) {
            Long sid = item.getSeller().getId();
            totalsBySeller.merge(sid, item.getLineTotal(), BigDecimal::add);
            sellers.put(sid, item.getSeller());
        }

        Instant now = Instant.now();
        for (Map.Entry<Long, BigDecimal> e : totalsBySeller.entrySet()) {
            BigDecimal amount = e.getValue();
            BigDecimal commission = amount.multiply(COMMISSION_RATE).setScale(2, RoundingMode.HALF_UP);
            BigDecimal payout = amount.subtract(commission);

            escrowRepository.save(EscrowTransaction.builder()
                    .order(order)
                    .seller(sellers.get(e.getKey()))
                    .buyer(order.getUser())
                    .amount(amount)
                    .commission(commission)
                    .sellerPayout(payout)
                    .status(EscrowStatus.HELD)
                    .heldAt(now)
                    .build());
        }
        log.info("Escrow created for order {} — {} seller(s)", order.getId(), totalsBySeller.size());
    }

    // ---------------- RELEASE ESCROW (called when order delivered) ----------------
    @Transactional
    public void releaseEscrowForOrder(Order order) {
        List<EscrowTransaction> rows = escrowRepository.findByOrderId(order.getId());
        if (rows.isEmpty()) {
            log.warn("No escrow rows found for order {} — nothing to release", order.getId());
            return;
        }
        Instant now = Instant.now();
        int released = 0;
        for (EscrowTransaction e : rows) {
            if (e.getStatus() == EscrowStatus.HELD) {
                e.setStatus(EscrowStatus.RELEASED);
                e.setReleasedAt(now);
                escrowRepository.save(e);
                released++;
            }
        }
        log.info("Released {} escrow row(s) for order {}", released, order.getId());
    }

    // ---------------- WALLET BALANCE ----------------
    @Transactional(readOnly = true)
    public SellerWalletResponse getWallet(String email) {
        User seller = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));

        BigDecimal earned   = escrowRepository.sumPayoutBySellerAndStatus(seller.getId(), EscrowStatus.RELEASED);
        BigDecimal held     = escrowRepository.sumPayoutBySellerAndStatus(seller.getId(), EscrowStatus.HELD);
        BigDecimal pendingW = withdrawalRepository.sumPendingBySeller(seller.getId());

        BigDecimal available = earned.subtract(pendingW);
        if (available.compareTo(BigDecimal.ZERO) < 0) {
            available = BigDecimal.ZERO;
        }

        return new SellerWalletResponse(
                available,
                held,
                earned,
                pendingW,
                MIN_WITHDRAWAL,
                COMMISSION_RATE.multiply(BigDecimal.valueOf(100)).intValue()
        );
    }
}