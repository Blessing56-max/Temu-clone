package com.kora.controller;

import com.kora.dto.response.OrderResponse;
import com.kora.dto.response.ProductResponse;
import com.kora.dto.response.SellerDashboardResponse;
import com.kora.dto.response.UserResponse;
import com.kora.entity.Order;
import com.kora.entity.Role;
import com.kora.entity.User;
import com.kora.exception.ApiException;
import com.kora.mapper.ProductMapper;
import com.kora.mapper.UserMapper;
import com.kora.repository.OrderRepository;
import com.kora.repository.ProductRepository;
import com.kora.repository.UserRepository;
import com.kora.service.NotificationService;
import com.kora.service.SellerDashboardService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/seller")
@RequiredArgsConstructor
@Tag(name = "Seller")
public class SellerController {

    private final SellerDashboardService dashboardService;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductMapper productMapper;
    private final UserMapper userMapper;
    private final OrderRepository orderRepository;
    private final NotificationService notificationService;

    @Transactional
    @PostMapping("/become")
    public ResponseEntity<UserResponse> becomeSeller(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (user.getRole() == Role.SELLER) {
            return ResponseEntity.ok(userMapper.toResponse(user));
        }
        if (user.getRole() == Role.ADMIN) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Admins cannot downgrade to seller");
        }

        user.setRole(Role.SELLER);
        userRepository.save(user);

        notificationService.notify(user, "SELLER_WELCOME",
                "Welcome to selling on Kora",
                "Your store is now open. Add your first product to start selling.",
                "/vendor/products/new");

        return ResponseEntity.ok(userMapper.toResponse(user));
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    @Transactional(readOnly = true)
    public SellerDashboardResponse dashboard(Authentication auth) {
        return dashboardService.getDashboard(auth.getName());
    }

    @GetMapping("/products")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    @Transactional(readOnly = true)
    public Page<ProductResponse> myProducts(Authentication auth,
                                            @RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "20") int size) {
        Long sellerId = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"))
                .getId();
        return productRepository.findBySellerId(sellerId, PageRequest.of(page, Math.min(size, 50)))
                .map(productMapper::toResponse);
    }

    @GetMapping("/orders")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    @Transactional(readOnly = true)
    public List<OrderResponse> myOrders(Authentication auth) {
        User seller = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));

        List<Order> recent = orderRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 100)).getContent();
        return recent.stream()
                .filter(o -> o.getItems().stream().anyMatch(i -> i.getSeller().getId().equals(seller.getId())))
                .map(order -> toSellerOrderResponse(order, seller.getId()))
                .toList();
    }

    @GetMapping("/pending-count")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    @Transactional(readOnly = true)
    public Map<String, Long> pendingCount(Authentication auth) {
        return Map.of("pending", dashboardService.countPendingOrders(auth.getName()));
    }

    private OrderResponse toSellerOrderResponse(Order o, Long sellerId) {
        var items = o.getItems().stream()
                .filter(i -> i.getSeller().getId().equals(sellerId))
                .map(i -> new com.kora.dto.response.OrderItemResponse(
                        i.getId(), i.getProduct().getId(), i.getProductName(),
                        i.getProduct().getImages().isEmpty() ? null : i.getProduct().getImages().get(0).getUrl(),
                        i.getUnitPrice(), i.getQuantity(), i.getLineTotal(),
                        i.getSeller().getId(), i.getSeller().getFullName()))
                .toList();

        return new OrderResponse(
                o.getId(), o.getStatus(),
                o.getSubtotal(), o.getDeliveryFee(), o.getTotal(),
                o.getDeliveryName(), o.getDeliveryPhone(), o.getDeliveryAddress(),
                o.getEstimatedDelivery(), items,
                o.getCreatedAt(), o.getUpdatedAt());
    }
}