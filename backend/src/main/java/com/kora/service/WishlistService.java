package com.kora.service;

import com.kora.dto.request.WishlistItemRequest;
import com.kora.dto.response.WishlistItemResponse;
import com.kora.dto.response.WishlistResponse;
import com.kora.entity.*;
import com.kora.exception.ApiException;
import com.kora.repository.ProductRepository;
import com.kora.repository.UserRepository;
import com.kora.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CartService cartService;

    @Transactional
    public WishlistResponse getOrCreate(String email) {
        Wishlist w = wishlistRepository.findByUserId(currentUserId(email))
                .orElseGet(() -> wishlistRepository.save(Wishlist.builder()
                        .user(userRepository.findByEmail(email).orElseThrow()).build()));
        return toResponse(w);
    }

    @Transactional
    public WishlistResponse add(String email, WishlistItemRequest req) {
        Wishlist w = wishlistRepository.findByUserId(currentUserId(email))
                .orElseGet(() -> wishlistRepository.save(Wishlist.builder()
                        .user(userRepository.findByEmail(email).orElseThrow()).build()));
        Product p = productRepository.findById(req.productId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));
        boolean exists = w.getItems().stream()
                .anyMatch(i -> i.getProduct().getId().equals(p.getId()));
        if (!exists) {
            w.getItems().add(WishlistItem.builder().wishlist(w).product(p).build());
        }
        return toResponse(wishlistRepository.save(w));
    }

    @Transactional
    public WishlistResponse remove(String email, Long itemId) {
        Wishlist w = wishlistRepository.findByUserId(currentUserId(email))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Wishlist not found"));
        w.getItems().removeIf(i -> i.getId().equals(itemId));
        return toResponse(wishlistRepository.save(w));
    }

    @Transactional
    public void moveToCart(String email, Long itemId) {
        Wishlist w = wishlistRepository.findByUserId(currentUserId(email))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Wishlist not found"));
        WishlistItem wi = w.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Item not in wishlist"));
        cartService.addItem(email, new com.kora.dto.request.CartItemRequest(
                wi.getProduct().getId(), 1));
        w.getItems().remove(wi);
        wishlistRepository.save(w);
    }

    private Long currentUserId(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"))
                .getId();
    }

    private WishlistResponse toResponse(Wishlist w) {
        List<WishlistItemResponse> items = w.getItems().stream().map(i -> {
            Product p = i.getProduct();
            return new WishlistItemResponse(i.getId(), p.getId(), p.getName(),
                    p.getImages().isEmpty() ? null : p.getImages().get(0).getUrl(),
                    p.getPrice(), p.getDiscountPrice(), p.getStock() > 0);
        }).toList();
        return new WishlistResponse(w.getId(), items, items.size());
    }
}