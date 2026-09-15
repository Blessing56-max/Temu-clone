package com.kora.service;

import com.kora.dto.request.CartItemRequest;
import com.kora.dto.request.CartItemUpdateRequest;
import com.kora.dto.response.CartItemResponse;
import com.kora.dto.response.CartResponse;
import com.kora.entity.*;
import com.kora.exception.ApiException;
import com.kora.repository.CartRepository;
import com.kora.repository.ProductRepository;
import com.kora.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Transactional
    public CartResponse getOrCreate(String email) {
        Cart cart = cartRepository.findByUserId(currentUserId(email))
                .orElseGet(() -> cartRepository.save(Cart.builder()
                        .user(userRepository.findByEmail(email).orElseThrow()).build()));
        return toResponse(cart);
    }

    @Transactional
    public CartResponse addItem(String email, CartItemRequest req) {
        Cart cart = cartRepository.findByUserId(currentUserId(email))
                .orElseGet(() -> cartRepository.save(Cart.builder()
                        .user(userRepository.findByEmail(email).orElseThrow()).build()));

        Product product = productRepository.findById(req.productId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));

        if (!product.isActive()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Product is not available");
        }
        if (product.getStock() < req.quantity()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Not enough stock");
        }

        cart.getItems().stream()
                .filter(i -> i.getProduct().getId().equals(product.getId()))
                .findFirst()
                .ifPresentOrElse(
                        item -> item.setQuantity(Math.min(item.getQuantity() + req.quantity(), 99)),
                        () -> cart.getItems().add(CartItem.builder()
                                .cart(cart).product(product).quantity(req.quantity()).build()));

        return toResponse(cartRepository.save(cart));
    }

    @Transactional
    public CartResponse updateItem(String email, Long itemId, CartItemUpdateRequest req) {
        Cart cart = cartRepository.findByUserId(currentUserId(email))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Cart not found"));
        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Item not in cart"));
        if (item.getProduct().getStock() < req.quantity()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Not enough stock");
        }
        item.setQuantity(req.quantity());
        return toResponse(cartRepository.save(cart));
    }

    @Transactional
    public CartResponse removeItem(String email, Long itemId) {
        Cart cart = cartRepository.findByUserId(currentUserId(email))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Cart not found"));
        cart.getItems().removeIf(i -> i.getId().equals(itemId));
        return toResponse(cartRepository.save(cart));
    }

    @Transactional
    public void clearCart(String email) {
        Cart cart = cartRepository.findByUserId(currentUserId(email)).orElse(null);
        if (cart != null) {
            cart.getItems().clear();
            cartRepository.save(cart);
        }
    }

    private Long currentUserId(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"))
                .getId();
    }

    private CartResponse toResponse(Cart cart) {
        List<CartItemResponse> items = cart.getItems().stream().map(i -> {
            Product p = i.getProduct();
            BigDecimal unit = p.getDiscountPrice() != null ? p.getDiscountPrice() : p.getPrice();
            return new CartItemResponse(
                    i.getId(), p.getId(), p.getName(),
                    p.getImages().isEmpty() ? null : p.getImages().get(0).getUrl(),
                    p.getPrice(), p.getDiscountPrice(), i.getQuantity(),
                    unit.multiply(BigDecimal.valueOf(i.getQuantity())), p.getStock());
        }).toList();
        int total = items.stream().mapToInt(CartItemResponse::quantity).sum();
        BigDecimal subtotal = items.stream()
                .map(CartItemResponse::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new CartResponse(cart.getId(), items, total, subtotal);
    }
}