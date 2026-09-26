package com.kora.controller;

import com.kora.dto.request.KycRejectRequest;
import com.kora.dto.response.KycStatusResponse;
import com.kora.entity.KycStatus;
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
@RequestMapping("/api/admin/kyc")
@RequiredArgsConstructor
@Tag(name = "Admin KYC")
@PreAuthorize("hasRole('ADMIN')")
public class AdminKycController {

    private final SellerKycService kycService;

    @GetMapping("/queue")
    @Operation(summary = "List KYC submissions by status")
    public ResponseEntity<List<KycStatusResponse>> queue(
            @RequestParam(defaultValue = "PENDING") KycStatus status) {
        return ResponseEntity.ok(kycService.listByStatus(status));
    }

    @PostMapping("/{id}/approve")
    @Operation(summary = "Approve a pending KYC submission")
    public ResponseEntity<KycStatusResponse> approve(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(kycService.adminApprove(id, auth.getName()));
    }

    @PostMapping("/{id}/reject")
    @Operation(summary = "Reject a pending KYC submission with a reason")
    public ResponseEntity<KycStatusResponse> reject(@PathVariable Long id,
                                                     @Valid @RequestBody KycRejectRequest req) {
        return ResponseEntity.ok(kycService.adminReject(id, req.reason()));
    }
}