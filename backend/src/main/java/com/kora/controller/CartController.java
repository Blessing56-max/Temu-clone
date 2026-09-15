package com.kora.controller;

import com.kora.dto.request.CartItemRequest;
import com.kora.dto.request.CartItemUpdateRequest;
import com.kora.dto.response.CartResponse;
import com.kora.service.CartService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Tag(name = "Cart")
public class CartController {

    private final CartService cartService;

    @GetMapping
    public CartResponse get(Authentication auth) { return cartService.getOrCreate(auth.getName()); }

    @PostMapping("/items")
    public CartResponse add(@Valid @RequestBody CartItemRequest req, Authentication auth) {
        return cartService.addItem(auth.getName(), req);
    }

    @PutMapping("/items/{id}")
    public CartResponse update(@PathVariable Long id,
                               @Valid @RequestBody CartItemUpdateRequest req,
                               Authentication auth) {
        return cartService.updateItem(auth.getName(), id, req);
    }

    @DeleteMapping("/items/{id}")
    public CartResponse remove(@PathVariable Long id, Authentication auth) {
        return cartService.removeItem(auth.getName(), id);
    }
}