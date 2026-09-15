package com.kora.service;

import com.kora.dto.request.UpdateUserRoleRequest;
import com.kora.dto.response.AdminStatsResponse;
import com.kora.dto.response.AuditLogResponse;
import com.kora.dto.response.UserResponse;
import com.kora.entity.*;
import com.kora.exception.ApiException;
import com.kora.mapper.UserMapper;
import com.kora.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;
    private final ProductViewRepository productViewRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserMapper userMapper;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public AdminStatsResponse getStats() {
        long totalUsers = userRepository.count();
        long totalCustomers = userRepository.countByRole(Role.CUSTOMER);
        long totalSellers = userRepository.countByRole(Role.SELLER);
        long totalAdmins = userRepository.countByRole(Role.ADMIN);

        long totalProducts = productRepository.count();
        long activeProducts = productRepository.findByActiveTrue(PageRequest.of(0, 1)).getTotalElements();

        long totalOrders = orderRepository.count();
        long pendingOrders = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() == OrderStatus.PENDING).count();
        long deliveredOrders = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() == OrderStatus.DELIVERED).count();

        BigDecimal totalRevenue = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() != OrderStatus.PENDING && o.getStatus() != OrderStatus.CANCELLED)
                .map(Order::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalReviews = reviewRepository.count();
        long totalProductViews = productViewRepository.count();

        return new AdminStatsResponse(
                totalUsers, totalCustomers, totalSellers, totalAdmins,
                totalProducts, activeProducts, totalOrders, pendingOrders, deliveredOrders,
                totalRevenue, totalReviews, totalProductViews);
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> listUsers(int page, int size) {
        return userRepository.findAllByOrderByCreatedAtDesc(
                PageRequest.of(page, Math.min(size, 100))).map(userMapper::toResponse);
    }

    @Transactional
    public UserResponse toggleSuspend(String adminEmail, Long userId) {
        User admin = userRepository.findByEmail(adminEmail).orElseThrow();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        if (user.getRole() == Role.ADMIN) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Cannot suspend an admin");
        }
        user.setEnabled(!user.isEnabled());
        userRepository.save(user);
        auditService.log(admin, user.isEnabled() ? "USER_ACTIVATED" : "USER_SUSPENDED",
                "USER", user.getId(), "User " + user.getEmail());
        return userMapper.toResponse(user);
    }

    @Transactional
    public UserResponse changeRole(String adminEmail, Long userId, UpdateUserRoleRequest req) {
        User admin = userRepository.findByEmail(adminEmail).orElseThrow();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        Role previous = user.getRole();
        user.setRole(req.role());
        userRepository.save(user);
        auditService.log(admin, "USER_ROLE_CHANGED", "USER", user.getId(),
                "Role: " + previous + " -> " + req.role());
        return userMapper.toResponse(user);
    }

    @Transactional(readOnly = true)
    public Page<AuditLogResponse> listAuditLogs(int page, int size) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(
                PageRequest.of(page, Math.min(size, 100)))
                .map(a -> new AuditLogResponse(a.getId(), a.getActorEmail(), a.getAction(),
                        a.getTargetType(), a.getTargetId(), a.getMetadata(), a.getCreatedAt()));
    }
}