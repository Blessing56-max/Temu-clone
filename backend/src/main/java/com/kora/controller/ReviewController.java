package com.kora.controller;

import com.kora.dto.request.ReviewRequest;
import com.kora.dto.response.ProductReviewsResponse;
import com.kora.dto.response.ReviewResponse;
import com.kora.service.ReviewService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Reviews")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/reviews")
    public ResponseEntity<ReviewResponse> create(@Valid @RequestBody ReviewRequest req,
                                                  Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reviewService.create(auth.getName(), req));
    }

    @GetMapping("/products/{productId}/reviews")
    public ProductReviewsResponse list(@PathVariable Long productId,
                                       @RequestParam(defaultValue = "0") int page,
                                       @RequestParam(defaultValue = "20") int size) {
        return reviewService.listForProduct(productId, page, size);
    }
}