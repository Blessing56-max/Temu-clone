package com.kora.controller;

import com.kora.dto.response.ProductResponse;
import com.kora.dto.response.SellerDashboardResponse;
import com.kora.mapper.ProductMapper;
import com.kora.repository.ProductRepository;
import com.kora.repository.UserRepository;
import com.kora.exception.ApiException;
import com.kora.service.SellerDashboardService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/seller")
@RequiredArgsConstructor
@Tag(name = "Seller Dashboard")
@PreAuthorize("hasAnyRole('SELLER','ADMIN')")
public class SellerController {

    private final SellerDashboardService dashboardService;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductMapper productMapper;

    @GetMapping("/dashboard")
    public SellerDashboardResponse dashboard(Authentication auth) {
        return dashboardService.getDashboard(auth.getName());
    }

    @GetMapping("/products")
    public Page<ProductResponse> myProducts(Authentication auth,
                                            @RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "20") int size) {
        Long sellerId = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"))
                .getId();
        return productRepository.findBySellerId(sellerId, PageRequest.of(page, Math.min(size, 50)))
                .map(productMapper::toResponse);
    }
}