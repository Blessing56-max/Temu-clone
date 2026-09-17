package com.kora.controller;

import com.kora.dto.request.LoginRequest;
import com.kora.dto.request.RefreshRequest;
import com.kora.dto.request.RegisterRequest;
import com.kora.dto.response.AuthResponse;
import com.kora.dto.response.UserResponse;
import com.kora.entity.User;
import com.kora.exception.ApiException;
import com.kora.mapper.UserMapper;
import com.kora.repository.UserRepository;
import com.kora.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @PostMapping("/register")
    @Operation(summary = "Register a new customer")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(req));
    }

    @PostMapping("/login")
    @Operation(summary = "Login with email and password")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Exchange a refresh token for a new access token")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshRequest req) {
        return ResponseEntity.ok(authService.refresh(req));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout and revoke refresh tokens")
    public ResponseEntity<Map<String, String>> logout(Authentication auth) {
        if (auth == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        authService.logout(auth.getName());
        return ResponseEntity.ok(Map.of("message", "Logged out"));
    }
    @PutMapping("/me")
    @Operation(summary = "Update current user profile")
    public ResponseEntity<UserResponse> updateProfile(@Valid @RequestBody com.kora.dto.request.UpdateProfileRequest req,
                                                       Authentication auth) {
        if (auth == null) throw new ApiException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        return ResponseEntity.ok(authService.updateProfile(auth.getName(), req));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change password for current user")
    public ResponseEntity<Map<String, String>> changePassword(@Valid @RequestBody com.kora.dto.request.ChangePasswordRequest req,
                                                              Authentication auth) {
        if (auth == null) throw new ApiException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        authService.changePassword(auth.getName(), req);
        return ResponseEntity.ok(Map.of("message", "Password changed. Please log in again."));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user")
    public ResponseEntity<UserResponse> me(Authentication auth) {
        if (auth == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        return ResponseEntity.ok(userMapper.toResponse(user));
    }
}