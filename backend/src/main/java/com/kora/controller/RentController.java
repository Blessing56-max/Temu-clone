package com.kora.controller;

import com.kora.dto.response.RentStatusResponse;
import com.kora.entity.RentPayment;
import com.kora.entity.User;
import com.kora.exception.ApiException;
import com.kora.repository.UserRepository;
import com.kora.service.RentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/seller/rent")
@RequiredArgsConstructor
@Tag(name = "Seller Rent")
@PreAuthorize("hasAnyRole('SELLER','ADMIN')")
public class RentController {

    private final RentService rentService;
    private final UserRepository userRepository;

    @GetMapping("/status")
    @Operation(summary = "Get current rent status, due date, and days left")
    public ResponseEntity<RentStatusResponse> status(Authentication auth) {
        User seller = loadUser(auth);
        var s = rentService.snapshot(seller);
        return ResponseEntity.ok(new RentStatusResponse(
                s.status(), s.paidUntil(), s.daysLeft(), s.monthlyAmount(), s.graceDays()));
    }

    @PostMapping("/pay")
    @Operation(summary = "Pay monthly rent (mock payment for Phase 2)")
    public ResponseEntity<Map<String, Object>> pay(Authentication auth) {
        User seller = loadUser(auth);
        RentPayment payment = rentService.payRent(seller);
        return ResponseEntity.ok(Map.of(
                "paymentId", payment.getId(),
                "amount", payment.getAmount(),
                "paidUntil", payment.getPeriodEnd(),
                "message", "Rent paid. Your store is active."
        ));
    }

    private User loadUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
    }
}