package com.kora.controller;

import com.kora.dto.request.WithdrawalRejectRequest;
import com.kora.dto.request.WithdrawalRequest;
import com.kora.dto.response.WithdrawalResponse;
import com.kora.entity.WithdrawalStatus;
import com.kora.service.SellerWithdrawalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Withdrawals")
public class SellerWithdrawalController {

    private final SellerWithdrawalService withdrawalService;

    // -------- SELLER: request payout --------
    @PostMapping("/seller/wallet/withdraw")
    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "Request a withdrawal to the seller's verified bank account")
    public ResponseEntity<WithdrawalResponse> request(@Valid @RequestBody WithdrawalRequest req,
                                                     Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(withdrawalService.request(auth.getName(), req.amount()));
    }

    // -------- SELLER: list own withdrawals --------
    @GetMapping("/seller/wallet/withdrawals")
    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "List the seller's withdrawal history")
    public ResponseEntity<List<WithdrawalResponse>> mine(Authentication auth,
                                                        @RequestParam(defaultValue = "0") int page,
                                                        @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(withdrawalService.myWithdrawals(auth.getName(), page, size));
    }

    // -------- ADMIN: queue --------
    @GetMapping("/admin/withdrawals")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List withdrawals (filter by status)")
    public ResponseEntity<List<WithdrawalResponse>> queue(@RequestParam(required = false) WithdrawalStatus status,
                                                          @RequestParam(defaultValue = "0") int page,
                                                          @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(withdrawalService.adminList(status, page, size));
    }

    // -------- ADMIN: approve → Paystack Transfer --------
    @PostMapping("/admin/withdrawals/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Approve a pending withdrawal and dispatch the Paystack transfer")
    public ResponseEntity<WithdrawalResponse> approve(@PathVariable Long id) {
        return ResponseEntity.ok(withdrawalService.approve(id));
    }

    // -------- ADMIN: reject --------
    @PostMapping("/admin/withdrawals/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reject a pending withdrawal with a reason")
    public ResponseEntity<WithdrawalResponse> reject(@PathVariable Long id,
                                                     @Valid @RequestBody WithdrawalRejectRequest req) {
        return ResponseEntity.ok(withdrawalService.reject(id, req.reason()));
    }
}