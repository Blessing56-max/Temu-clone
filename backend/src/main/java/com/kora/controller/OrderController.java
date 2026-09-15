package com.kora.controller;

import com.kora.dto.request.CheckoutRequest;
import com.kora.dto.request.OrderStatusUpdateRequest;
import com.kora.dto.response.OrderResponse;
import com.kora.dto.response.OrderTrackingResponse;
import com.kora.service.OrderService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Orders")
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    public ResponseEntity<OrderResponse> checkout(@Valid @RequestBody CheckoutRequest req,
                                                   Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.checkout(auth.getName(), req));
    }

    @PostMapping("/{id}/pay")
    public OrderResponse pay(@PathVariable Long id, Authentication auth) {
        return orderService.markAsPaid(auth.getName(), id);
    }

    @GetMapping
    public Page<OrderResponse> list(Authentication auth,
                                    @RequestParam(defaultValue = "0") int page,
                                    @RequestParam(defaultValue = "20") int size) {
        boolean isAdmin = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_ADMIN"));
        return isAdmin
                ? orderService.listAll(page, size)
                : orderService.listMyOrders(auth.getName(), page, size);
    }

    @GetMapping("/{id}")
    public OrderResponse get(@PathVariable Long id, Authentication auth) {
        boolean isAdmin = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_ADMIN"));
        return orderService.getById(auth.getName(), id, isAdmin);
    }

    @GetMapping("/{id}/tracking")
    public OrderTrackingResponse tracking(@PathVariable Long id, Authentication auth) {
        return orderService.getTracking(auth.getName(), id);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public OrderResponse updateStatus(@PathVariable Long id,
                                      @Valid @RequestBody OrderStatusUpdateRequest req,
                                      Authentication auth) {
        boolean isAdmin = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_ADMIN"));
        return orderService.updateStatus(auth.getName(), id, req, isAdmin);
    }
}