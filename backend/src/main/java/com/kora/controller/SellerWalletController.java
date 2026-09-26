package com.kora.controller;

import com.kora.dto.response.SellerWalletResponse;
import com.kora.service.SellerWalletService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/seller/wallet")
@RequiredArgsConstructor
@Tag(name = "Seller Wallet")
@PreAuthorize("hasAnyRole('SELLER','ADMIN')")
public class SellerWalletController {

    private final SellerWalletService walletService;

    @GetMapping
    @Operation(summary = "Get seller wallet balance breakdown")
    public ResponseEntity<SellerWalletResponse> wallet(Authentication auth) {
        return ResponseEntity.ok(walletService.getWallet(auth.getName()));
    }
}