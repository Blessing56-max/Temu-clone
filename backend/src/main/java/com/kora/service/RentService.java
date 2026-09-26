package com.kora.service;

import com.kora.entity.RentPayment;
import com.kora.entity.RentStatus;
import com.kora.entity.Role;
import com.kora.entity.User;
import com.kora.repository.RentPaymentRepository;
import com.kora.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RentService {

    public static final BigDecimal MONTHLY_RENT = new BigDecimal("10000.00");
    public static final int GRACE_DAYS = 3;
    public static final int REMIND_DAYS_BEFORE = 5;

    private final UserRepository userRepository;
    private final RentPaymentRepository rentPaymentRepository;
    private final NotificationService notificationService;

    // ---------------- SCHEDULED: daily at 03:00 ----------------
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void dailyRentCheck() {
        log.info("Rent check starting...");
        List<User> sellers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.SELLER)
                .toList();

        int changed = 0;
        for (User s : sellers) {
            RentStatus before = s.getRentStatus();
            RentStatus after = computeStatus(s);
            if (before != after) {
                s.setRentStatus(after);
                userRepository.save(s);
                notifyTransition(s, before, after);
                changed++;
            }
        }
        log.info("Rent check complete — {} status change(s)", changed);
    }

    /** Derived status: TRIAL until first payment, then ACTIVE → GRACE → LOCKED based on daysLeft. */
    public RentStatus computeStatus(User seller) {
        if (seller.getRole() != Role.SELLER) return RentStatus.NOT_APPLICABLE;

        Instant due = seller.getRentPaidUntil();
        if (due == null) return RentStatus.TRIAL;

        long daysLeft = ChronoUnit.DAYS.between(Instant.now(), due);

        if (daysLeft > 0) return seller.getLastRentPaidAt() == null
                ? RentStatus.TRIAL
                : RentStatus.ACTIVE;
        if (daysLeft >= -GRACE_DAYS) return RentStatus.GRACE;
        return RentStatus.LOCKED;
    }

    // ---------------- NOTIFICATIONS on state change ----------------
    private void notifyTransition(User seller, RentStatus from, RentStatus to) {
        switch (to) {
            case GRACE -> notificationService.notify(seller, "RENT_DUE",
                    "Rent overdue",
                    "Your seller rent is overdue. You have " + GRACE_DAYS +
                            " days of grace before your store is locked.",
                    "/vendor/dashboard");

            case LOCKED -> notificationService.notify(seller, "RENT_LOCKED",
                    "Store locked",
                    "Your store has been locked due to unpaid rent of N" + MONTHLY_RENT +
                            ". Your products are hidden from buyers. Pay to unlock.",
                    "/vendor/dashboard");

            case ACTIVE -> {
                if (from == RentStatus.LOCKED || from == RentStatus.GRACE) {
                    notificationService.notify(seller, "RENT_PAID",
                            "Store unlocked",
                            "Rent paid. Your store is active again and products are visible to buyers.",
                            "/vendor/dashboard");
                }
            }
            default -> { }
        }
    }

    // ---------------- PAY RENT (mock payment for Phase 2) ----------------
    @Transactional
    public RentPayment payRent(User seller) {
        Instant now = Instant.now();
        Instant periodStart = seller.getRentPaidUntil() != null && seller.getRentPaidUntil().isAfter(now)
                ? seller.getRentPaidUntil()
                : now;
        Instant periodEnd = periodStart.plus(30, ChronoUnit.DAYS);

        RentPayment payment = RentPayment.builder()
                .seller(seller)
                .amount(MONTHLY_RENT)
                .periodStart(periodStart)
                .periodEnd(periodEnd)
                .status("PAID")
                .paidAt(now)
                .build();
        rentPaymentRepository.save(payment);

        seller.setRentPaidUntil(periodEnd);
        seller.setLastRentPaidAt(now);
        seller.setRentStatus(RentStatus.ACTIVE);
        userRepository.save(seller);

        notificationService.notify(seller, "RENT_PAID",
                "Rent paid",
                "N" + MONTHLY_RENT + " received. Your store is active until " + periodEnd + ".",
                "/vendor/wallet");

        log.info("Rent paid by {} — active until {}", seller.getEmail(), periodEnd);
        return payment;
    }

    // ---------------- STATUS SNAPSHOT for UI ----------------
    public RentSnapshot snapshot(User seller) {
        Instant due = seller.getRentPaidUntil();
        long daysLeft = due == null ? 30 : ChronoUnit.DAYS.between(Instant.now(), due);
        return new RentSnapshot(
                seller.getRentStatus(),
                due,
                daysLeft,
                MONTHLY_RENT,
                GRACE_DAYS
        );
    }

    public record RentSnapshot(
            RentStatus status,
            Instant paidUntil,
            long daysLeft,
            BigDecimal monthlyAmount,
            int graceDays
    ) {}
}