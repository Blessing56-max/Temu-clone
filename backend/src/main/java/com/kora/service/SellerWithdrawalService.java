package com.kora.service;

import com.kora.dto.response.SellerWalletResponse;
import com.kora.dto.response.WithdrawalResponse;
import com.kora.entity.*;
import com.kora.exception.ApiException;
import com.kora.paystack.PaystackDtos;
import com.kora.paystack.PaystackService;
import com.kora.repository.SellerVerificationRepository;
import com.kora.repository.UserRepository;
import com.kora.repository.WithdrawalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SellerWithdrawalService {

    private final WithdrawalRepository withdrawalRepository;
    private final UserRepository userRepository;
    private final SellerVerificationRepository verificationRepository;
    private final SellerWalletService walletService;
    private final PaystackService paystackService;
    private final NotificationService notificationService;

    // ---------------- SELLER: REQUEST ----------------
    @Transactional
    public WithdrawalResponse request(String email, BigDecimal amount) {
        User seller = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (seller.getKycStatus() != KycStatus.VERIFIED) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Complete KYC before withdrawing funds");
        }

        SellerVerification kyc = verificationRepository.findBySellerId(seller.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "No KYC record found"));

        if (kyc.getPaystackRecipientCode() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "No Paystack recipient on file. Resubmit KYC.");
        }

        SellerWalletResponse wallet = walletService.getWallet(email);
        if (amount.compareTo(wallet.availableBalance()) > 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                "Amount exceeds available balance (" + wallet.availableBalance() + ")");
        }

        Withdrawal w = Withdrawal.builder()
                .seller(seller)
                .amount(amount)
                .status(WithdrawalStatus.PENDING)
                .build();
        w = withdrawalRepository.save(w);

        notificationService.notify(seller, "WITHDRAWAL_REQUESTED",
                "Withdrawal requested",
                "Your request for N" + amount + " is awaiting admin approval. You'll be notified once processed.",
                "/vendor/wallet");

        log.info("Withdrawal requested by {} — N{}", email, amount);
        return toResponse(w);
    }

    // ---------------- SELLER: LIST ----------------
    @Transactional(readOnly = true)
    public List<WithdrawalResponse> myWithdrawals(String email, int page, int size) {
        User seller = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
        Page<Withdrawal> result = withdrawalRepository.findBySellerIdOrderByRequestedAtDesc(
                seller.getId(), PageRequest.of(page, Math.min(size, 50)));
        return result.map(this::toResponse).toList();
    }

    // ---------------- ADMIN: LIST ----------------
    @Transactional(readOnly = true)
    public List<WithdrawalResponse> adminList(WithdrawalStatus status, int page, int size) {
        Page<Withdrawal> result = (status == null)
                ? withdrawalRepository.findAll(
                        PageRequest.of(page, Math.min(size, 50)))
                : withdrawalRepository.findByStatusOrderByRequestedAtAsc(
                        status, PageRequest.of(page, Math.min(size, 50)));
        return result.map(this::toResponse).toList();
    }

    // ---------------- ADMIN: APPROVE + PAYSTACK TRANSFER ----------------
    @Transactional
    public WithdrawalResponse approve(Long id) {
        Withdrawal w = withdrawalRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Withdrawal not found"));

        if (w.getStatus() != WithdrawalStatus.PENDING) {
            throw new ApiException(HttpStatus.CONFLICT, "Withdrawal is not pending");
        }

        SellerVerification kyc = verificationRepository.findBySellerId(w.getSeller().getId())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Seller has no KYC record"));

        String recipientCode = kyc.getPaystackRecipientCode();
        if (recipientCode == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Seller has no Paystack recipient code");
        }

        w.setStatus(WithdrawalStatus.PROCESSING);
        withdrawalRepository.save(w);

        try {
            PaystackDtos.InitiateTransferResponse.TransferData result =
                    paystackService.initiateTransfer(
                            w.getAmount(),
                            recipientCode,
                            "Kora payout for withdrawal #" + w.getId());

            w.setPaystackTransferCode(result.transferCode());
            w.setPaystackReference(result.reference());

            // Paystack returns "pending" initially; treat both as success for now.
            // Webhook (future) would later flip this to COMPLETED.
            w.setStatus(WithdrawalStatus.COMPLETED);
            w.setCompletedAt(Instant.now());
            withdrawalRepository.save(w);

            notificationService.notify(w.getSeller(), "WITHDRAWAL_COMPLETED",
                    "Withdrawal completed",
                    "N" + w.getAmount() + " has been sent to your bank. Ref: " + result.reference(),
                    "/vendor/wallet");

            log.info("Withdrawal #{} completed — N{} → {}",
                    id, w.getAmount(), kyc.getAccountName());
            return toResponse(w);

        } catch (Exception e) {
            w.setStatus(WithdrawalStatus.FAILED);
            w.setFailureReason(e.getMessage() == null ? "Paystack transfer failed" : e.getMessage());
            withdrawalRepository.save(w);

            notificationService.notify(w.getSeller(), "WITHDRAWAL_FAILED",
                    "Withdrawal failed",
                    "N" + w.getAmount() + " could not be sent: " + w.getFailureReason(),
                    "/vendor/wallet");

            log.error("Withdrawal #{} failed", id, e);
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Paystack transfer failed: " + e.getMessage());
        }
    }

    // ---------------- ADMIN: REJECT ----------------
    @Transactional
    public WithdrawalResponse reject(Long id, String reason) {
        Withdrawal w = withdrawalRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Withdrawal not found"));

        if (w.getStatus() != WithdrawalStatus.PENDING) {
            throw new ApiException(HttpStatus.CONFLICT, "Withdrawal is not pending");
        }

        w.setStatus(WithdrawalStatus.FAILED);
        w.setFailureReason(reason);
        withdrawalRepository.save(w);

        notificationService.notify(w.getSeller(), "WITHDRAWAL_REJECTED",
                "Withdrawal rejected",
                "N" + w.getAmount() + " request was rejected: " + reason,
                "/vendor/wallet");

        return toResponse(w);
    }

    private WithdrawalResponse toResponse(Withdrawal w) {
        return new WithdrawalResponse(
                w.getId(),
                w.getAmount(),
                w.getStatus(),
                w.getSeller().getFullName(),
                w.getSeller().getEmail(),
                w.getPaystackTransferCode(),
                w.getPaystackReference(),
                w.getFailureReason(),
                w.getRequestedAt(),
                w.getCompletedAt()
        );
    }
}