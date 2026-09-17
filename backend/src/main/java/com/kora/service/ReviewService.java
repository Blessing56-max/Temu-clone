package com.kora.service;

import com.kora.dto.request.ReviewRequest;
import com.kora.dto.response.ProductReviewsResponse;
import com.kora.dto.response.ReviewResponse;
import com.kora.entity.Product;
import com.kora.entity.Review;
import com.kora.entity.User;
import com.kora.exception.ApiException;
import com.kora.repository.OrderItemRepository;
import com.kora.repository.ProductRepository;
import com.kora.repository.ReviewRepository;
import com.kora.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
    private final NotificationService notificationService;

    @Transactional
    public ReviewResponse create(String email, ReviewRequest req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));

        Product product = productRepository.findById(req.productId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));

        if (reviewRepository.existsByUserIdAndProductId(user.getId(), product.getId())) {
            throw new ApiException(HttpStatus.CONFLICT, "You already reviewed this product");
        }

        boolean purchased = orderItemRepository.userHasPurchasedDelivered(user.getId(), product.getId());
        if (!purchased) {
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "You can only review products you have received");
        }

        Review review = Review.builder()
                .user(user)
                .product(product)
                .rating(req.rating())
                .comment(req.comment())
                .build();

        Review saved = reviewRepository.save(review);

        // Notify the seller that their product got a review
        if (product.getSeller() != null && !product.getSeller().getId().equals(user.getId())) {
            notificationService.notify(product.getSeller(), "REVIEW_POSTED",
                    "New review on " + product.getName(),
                    user.getFullName() + " rated your product " + req.rating() + "/5" +
                            (req.comment() != null && !req.comment().isBlank()
                                    ? ": \"" + (req.comment().length() > 80 ? req.comment().substring(0, 80) + "..." : req.comment()) + "\""
                                    : "."),
                    "/products/" + product.getId());
        }

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public ProductReviewsResponse listForProduct(Long productId, int page, int size) {
        Page<Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(
                productId, PageRequest.of(page, Math.min(size, 50)));
        Double avg = reviewRepository.averageRating(productId);
        long count = reviewRepository.countByProductId(productId);

        return new ProductReviewsResponse(
                productId,
                avg == null ? null : Math.round(avg * 10.0) / 10.0,
                count,
                reviews.map(this::toResponse).getContent());
    }

    private ReviewResponse toResponse(Review r) {
        return new ReviewResponse(
                r.getId(), r.getProduct().getId(),
                r.getUser().getId(), r.getUser().getFullName(),
                r.getRating(), r.getComment(), r.getCreatedAt());
    }
}