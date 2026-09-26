package com.kora.controller;

import com.kora.dto.request.KycSubmissionRequest;
import com.kora.dto.request.ResolveAccountRequest;
import com.kora.dto.response.BankResponse;
import com.kora.dto.response.KycStatusResponse;
import com.kora.dto.response.ResolveAccountResponse;
import com.kora.service.SellerKycService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seller/kyc")
@RequiredArgsConstructor
@Tag(name = "Seller KYC")
@PreAuthorize("hasAnyRole('SELLER','ADMIN')")
public class SellerKycController {

    private final SellerKycService kycService;

    @PostMapping("/submit")
    @Operation(summary = "Submit KYC details for verification")
    public ResponseEntity<KycStatusResponse> submit(@Valid @RequestBody KycSubmissionRequest req,
                                                    Authentication auth) {
        return ResponseEntity.ok(kycService.submit(auth.getName(), req));
    }

    @GetMapping("/status")
    @Operation(summary = "Get current KYC status")
    public ResponseEntity<KycStatusResponse> status(Authentication auth) {
        return ResponseEntity.ok(kycService.getStatus(auth.getName()));
    }

    @GetMapping("/banks")
    @Operation(summary = "List Nigerian banks from Paystack")
    public ResponseEntity<List<BankResponse>> banks() {
        return ResponseEntity.ok(kycService.listBanks());
    }

    @PostMapping("/resolve-account")
    @Operation(summary = "Resolve a bank account name (preview before submit)")
    public ResponseEntity<ResolveAccountResponse> resolve(@Valid @RequestBody ResolveAccountRequest req,
                                                          Authentication auth) {
        return ResponseEntity.ok(kycService.resolveAccount(auth.getName(), req));
    }
}