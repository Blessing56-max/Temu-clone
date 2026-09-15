package com.kora.controller;

import com.kora.dto.request.WishlistItemRequest;
import com.kora.dto.response.WishlistResponse;
import com.kora.service.WishlistService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
@Tag(name = "Wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public WishlistResponse get(Authentication auth) { return wishlistService.getOrCreate(auth.getName()); }

    @PostMapping("/items")
    public WishlistResponse add(@Valid @RequestBody WishlistItemRequest req, Authentication auth) {
        return wishlistService.add(auth.getName(), req);
    }

    @DeleteMapping("/items/{id}")
    public WishlistResponse remove(@PathVariable Long id, Authentication auth) {
        return wishlistService.remove(auth.getName(), id);
    }

    @PostMapping("/items/{id}/move-to-cart")
    public ResponseEntity<Map<String, String>> move(@PathVariable Long id, Authentication auth) {
        wishlistService.moveToCart(auth.getName(), id);
        return ResponseEntity.ok(Map.of("message", "Moved to cart"));
    }
}