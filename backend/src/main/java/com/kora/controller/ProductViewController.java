package com.kora.controller;

import com.kora.entity.Product;
import com.kora.entity.ProductView;
import com.kora.entity.User;
import com.kora.exception.ApiException;
import com.kora.repository.ProductRepository;
import com.kora.repository.ProductViewRepository;
import com.kora.repository.UserRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Product Views")
public class ProductViewController {

    private final ProductViewRepository productViewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @PostMapping("/{id}/view")
    public ResponseEntity<Map<String, Object>> recordView(@PathVariable Long id, Authentication auth) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));

        User user = null;
        if (auth != null) {
            user = userRepository.findByEmail(auth.getName()).orElse(null);
        }

        productViewRepository.save(ProductView.builder()
                .product(product)
                .user(user)
                .build());

        long total = productViewRepository.countByProductId(id);
        return ResponseEntity.ok(Map.of("productId", id, "totalViews", total));
    }
}