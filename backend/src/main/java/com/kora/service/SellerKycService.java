package com.kora.service;

import com.kora.dto.request.KycSubmissionRequest;
import com.kora.dto.request.ResolveAccountRequest;
import com.kora.dto.response.BankResponse;
import com.kora.dto.response.KycStatusResponse;
import com.kora.dto.response.ResolveAccountResponse;
import com.kora.entity.KycStatus;
import com.kora.entity.Role;
import com.kora.entity.SellerVerification;
import com.kora.entity.User;
import com.kora.exception.ApiException;
import com.kora.paystack.PaystackService;
import com.kora.repository.SellerVerificationRepository;
import com.kora.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SellerKycService {

    private final UserRepository userRepository;
    private final SellerVerificationRepository verificationRepository;
    private final PaystackService paystackService;
    private final NotificationService notificationService;

    // ---------------- SUBMIT ----------------
    @Transactional
    public KycStatusResponse submit(String email, KycSubmissionRequest req) {
        User seller = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (seller.getRole() != Role.SELLER) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only sellers can submit KYC");
        }

        SellerVerification kyc = verificationRepository.findBySellerId(seller.getId())
                .orElseGet(() -> SellerVerification.builder().seller(seller).build());

        if (kyc.getStatus() == KycStatus.VERIFIED) {
            throw new ApiException(HttpStatus.CONFLICT, "KYC already verified");
        }
        if (kyc.getStatus() == KycStatus.PENDING) {
            throw new ApiException(HttpStatus.CONFLICT, "KYC is pending admin review. Please wait.");
        }

        // Verify bank account with Paystack
        String resolvedName = paystackService.resolveAccountName(
                req.accountNumber(), req.bankCode());

        boolean nameMatches = namesMatch(seller.getFullName(), resolvedName);

        kyc.setIdType(req.idType());
        kyc.setIdNumber(req.idNumber());
        kyc.setIdDocumentUrl(req.idDocumentUrl());
        kyc.setSelfieUrl(req.selfieUrl());
        kyc.setBusinessName(req.businessName());
        kyc.setBusinessAddress(req.businessAddress());
        kyc.setCity(req.city());
        kyc.setState(req.state());
        kyc.setCountry("Nigeria");
        kyc.setZipCode(req.zipCode());
        kyc.setLatitude(req.latitude());
        kyc.setLongitude(req.longitude());
        kyc.setBankName(req.bankName());
        kyc.setBankCode(req.bankCode());
        kyc.setAccountNumber(req.accountNumber());
        kyc.setAccountName(resolvedName);
        kyc.setRejectionReason(null);

        if (nameMatches) {
            // Auto-verify: register transfer recipient on Paystack
            String recipientCode = paystackService.createTransferRecipient(
                    resolvedName, req.accountNumber(), req.bankCode());
            kyc.setPaystackRecipientCode(recipientCode);
            kyc.setStatus(KycStatus.VERIFIED);
            kyc.setVerifiedAt(Instant.now());
            seller.setKycStatus(KycStatus.VERIFIED);

            notificationService.notify(seller, "KYC_VERIFIED",
                    "You are verified",
                    "Your KYC has been approved. You can now list products and receive payouts.",
                    "/vendor/dashboard");
        } else {
            kyc.setStatus(KycStatus.PENDING);
            seller.setKycStatus(KycStatus.PENDING);

            notificationService.notify(seller, "KYC_PENDING",
                    "KYC under review",
                    "The bank account name (" + resolvedName + ") doesn't match your profile name (" +
                            seller.getFullName() + "). An admin will review your submission.",
                    "/vendor/dashboard");
        }

        userRepository.save(seller);
        SellerVerification saved = verificationRepository.save(kyc);

        log.info("KYC submitted by {} — status={} nameMatch={}",
                email, saved.getStatus(), nameMatches);

        return toResponse(saved);
    }

    // ---------------- GET STATUS ----------------
    @Transactional(readOnly = true)
    public KycStatusResponse getStatus(String email) {
        User seller = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));

        SellerVerification kyc = verificationRepository.findBySellerId(seller.getId())
                .orElse(null);

        if (kyc == null) {
            return new KycStatusResponse(KycStatus.UNVERIFIED, null,
                    null, null, null, null, null, null, null);
        }
        return toResponse(kyc);
    }

    // ---------------- LIST BANKS ----------------
    public List<BankResponse> listBanks() {
        return paystackService.listBanks().stream()
                .map(b -> new BankResponse(b.name(), b.code(), b.slug()))
                .toList();
    }

    // ---------------- PREVIEW RESOLVE ----------------
    public ResolveAccountResponse resolveAccount(String email, ResolveAccountRequest req) {
        User seller = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));

        String resolvedName = paystackService.resolveAccountName(
                req.accountNumber(), req.bankCode());
        boolean matches = namesMatch(seller.getFullName(), resolvedName);

        return new ResolveAccountResponse(resolvedName, matches, seller.getFullName());
    }

    // ---------------- Helpers ----------------
    /**
     * Loose name match: Paystack returns names uppercase (e.g. "ADEDAYO NATHAN"),
     * users type mixed-case with optional middle names ("Adedayo O. Nathan").
     * We normalize both to lowercase token sets and require every token of the
     * SHORTER name to appear in the longer one.
     */
    private boolean namesMatch(String a, String b) {
        if (a == null || b == null) return false;
        Set<String> ta = tokens(a);
        Set<String> tb = tokens(b);
        if (ta.isEmpty() || tb.isEmpty()) return false;
        Set<String> shorter = ta.size() <= tb.size() ? ta : tb;
        Set<String> longer = ta.size() <= tb.size() ? tb : ta;
        return longer.containsAll(shorter);
    }

    private Set<String> tokens(String name) {
        return Arrays.stream(name.toLowerCase(Locale.ROOT)
                        .replaceAll("[^a-z\\s]", " ")
                        .trim()
                        .split("\\s+"))
                .filter(t -> t.length() > 1)  // skip initials
                .collect(Collectors.toSet());
    }

    private KycStatusResponse toResponse(SellerVerification k) {
        return new KycStatusResponse(
                k.getStatus(),
                k.getRejectionReason(),
                k.getBusinessName(),
                k.getAccountName(),
                k.getBankName(),
                maskAccount(k.getAccountNumber()),
                k.getAccountNumber(),
                k.getCreatedAt(),
                k.getVerifiedAt()
        );
    }

    private String maskAccount(String num) {
        if (num == null || num.length() < 4) return num;
        return "****" + num.substring(num.length() - 4);
    }

    // ---------------- ADMIN: LIST PENDING KYC ----------------
    @Transactional(readOnly = true)
    public List<KycStatusResponse> listByStatus(KycStatus status) {
        return verificationRepository
                .findByStatusOrderByCreatedAtAsc(status, org.springframework.data.domain.PageRequest.of(0, 100))
                .map(this::toResponse)
                .toList();
    }

    // ---------------- ADMIN: APPROVE ----------------
    @Transactional
    public KycStatusResponse adminApprove(Long verificationId, String adminEmail) {
        SellerVerification kyc = verificationRepository.findById(verificationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Verification not found"));

        if (kyc.getStatus() != KycStatus.PENDING) {
            throw new ApiException(HttpStatus.CONFLICT, "Only PENDING submissions can be approved");
        }

        // Register the seller with Paystack now (we deferred this until admin approval).
        // If Paystack rejects (sandbox limitation / stale account), we still approve KYC —
        // the recipient code can be retried when the seller requests their first withdrawal.
        try {
            String recipientCode = paystackService.createTransferRecipient(
                    kyc.getAccountName(), kyc.getAccountNumber(), kyc.getBankCode());
            kyc.setPaystackRecipientCode(recipientCode);
        } catch (Exception e) {
            log.warn("Paystack recipient creation failed for KYC #{} — approving anyway: {}",
                    verificationId, e.getMessage());
        }

        kyc.setStatus(KycStatus.VERIFIED);
        kyc.setVerifiedAt(java.time.Instant.now());
        kyc.setRejectionReason(null);

        User seller = kyc.getSeller();
        seller.setKycStatus(KycStatus.VERIFIED);

        User admin = userRepository.findByEmail(adminEmail).orElse(null);
        kyc.setReviewedBy(admin);

        userRepository.save(seller);
        verificationRepository.save(kyc);

        notificationService.notify(seller, "KYC_VERIFIED",
                "You are verified",
                "Your KYC has been approved. You can now list products and receive payouts.",
                "/vendor/dashboard");

        return toResponse(kyc);
    }

    // ---------------- ADMIN: REJECT ----------------
    @Transactional
    public KycStatusResponse adminReject(Long verificationId, String reason) {
        SellerVerification kyc = verificationRepository.findById(verificationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Verification not found"));

        if (kyc.getStatus() != KycStatus.PENDING) {
            throw new ApiException(HttpStatus.CONFLICT, "Only PENDING submissions can be rejected");
        }

        kyc.setStatus(KycStatus.REJECTED);
        kyc.setRejectionReason(reason);

        User seller = kyc.getSeller();
        seller.setKycStatus(KycStatus.REJECTED);

        userRepository.save(seller);
        verificationRepository.save(kyc);

        notificationService.notify(seller, "KYC_REJECTED",
                "KYC rejected",
                "Your KYC submission was rejected: " + reason + ". You can resubmit from your dashboard.",
                "/vendor/kyc");

        return toResponse(kyc);
    }
}