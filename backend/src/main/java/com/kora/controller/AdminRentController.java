package com.kora.controller;

import com.kora.entity.Role;
import com.kora.entity.User;
import com.kora.repository.UserRepository;
import com.kora.service.RentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/admin/rent")
@RequiredArgsConstructor
@Tag(name = "Admin Rent")
@PreAuthorize("hasRole('ADMIN')")
public class AdminRentController {

    private final UserRepository userRepository;
    private final RentService rentService;

    @GetMapping("/sellers")
    @Operation(summary = "List all sellers with their rent status")
    public ResponseEntity<List<Row>> sellers() {
        List<Row> out = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.SELLER)
                .map(u -> {
                    var snap = rentService.snapshot(u);
                    return new Row(
                            u.getId(),
                            u.getFullName(),
                            u.getEmail(),
                            snap.status().name(),
                            snap.paidUntil(),
                            snap.daysLeft(),
                            u.isEnabled()
                    );
                })
                .toList();
        return ResponseEntity.ok(out);
    }

    public record Row(
            Long id,
            String name,
            String email,
            String rentStatus,
            Instant paidUntil,
            long daysLeft,
            boolean enabled
    ) {}
}