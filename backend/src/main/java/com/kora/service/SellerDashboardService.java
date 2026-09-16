package com.kora.service;

import com.kora.dto.response.OrderResponse;
import com.kora.dto.response.SellerDashboardResponse;
import com.kora.dto.response.SellerDashboardResponse.MonthlyRevenue;
import com.kora.dto.response.SellerDashboardResponse.ProductStat;
import com.kora.entity.User;
import com.kora.exception.ApiException;
import com.kora.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SellerDashboardService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductViewRepository productViewRepository;
    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;
    private final OrderService orderService;

    @Transactional(readOnly = true)
    public SellerDashboardResponse getDashboard(String email) {
        User seller = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));

        Long sellerId = seller.getId();

        BigDecimal totalRevenue = orderItemRepository.totalRevenueBySeller(sellerId);
        long totalOrders = orderItemRepository.totalOrdersBySeller(sellerId);
        long totalUnitsSold = orderItemRepository.totalUnitsSoldBySeller(sellerId);
        long totalProducts = productRepository.findBySellerId(sellerId, PageRequest.of(0, 1)).getTotalElements();

        long totalReviews = productRepository.findBySellerId(sellerId, PageRequest.of(0, 1000))
                .getContent().stream()
                .mapToLong(p -> reviewRepository.countByProductId(p.getId()))
                .sum();

        List<Long> productIds = productRepository.findBySellerId(sellerId, PageRequest.of(0, 1000))
                .getContent().stream().map(p -> p.getId()).toList();

        Double averageRating = null;
        if (!productIds.isEmpty()) {
            double sum = 0;
            int count = 0;
            for (Long pid : productIds) {
                Double avg = reviewRepository.averageRating(pid);
                if (avg != null) { sum += avg; count++; }
            }
            if (count > 0) averageRating = Math.round((sum / count) * 10.0) / 10.0;
        }

        List<Object[]> topSellingRaw = orderItemRepository.topSellingBySeller(sellerId, PageRequest.of(0, 5));
        List<ProductStat> topSelling = topSellingRaw.stream()
                .map(r -> {
                    Long pid = ((Number) r[0]).longValue();
                    String name = (String) r[1];
                    long units = ((Number) r[2]).longValue();
                    BigDecimal revenue = (BigDecimal) r[3];
                    long views = productViewRepository.countByProductId(pid);
                    return new ProductStat(pid, name, units, revenue, views);
                })
                .toList();

        List<Object[]> topViewedRaw = productViewRepository.topViewedBySeller(sellerId);
        List<ProductStat> topViewed = topViewedRaw.stream()
                .limit(5)
                .map(r -> {
                    Long pid = ((Number) r[0]).longValue();
                    String name = (String) r[1];
                    long views = ((Number) r[2]).longValue();
                    return new ProductStat(pid, name, 0, BigDecimal.ZERO, views);
                })
                .toList();

        List<Object[]> monthlyRaw = orderItemRepository.monthlyRevenueBySeller(sellerId);
        List<MonthlyRevenue> monthly = monthlyRaw.stream()
                .map(r -> new MonthlyRevenue((String) r[0], (BigDecimal) r[1]))
                .toList();

        return new SellerDashboardResponse(
                sellerId,
                seller.getFullName(),
                totalRevenue,
                totalOrders,
                totalUnitsSold,
                totalProducts,
                totalReviews,
                averageRating,
                topSelling,
                topViewed,
                monthly);
    }

    @Transactional(readOnly = true)
    public long countPendingOrders(String email) {
        User seller = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
        return orderItemRepository.countPendingFulfilmentBySeller(seller.getId());
    }
}