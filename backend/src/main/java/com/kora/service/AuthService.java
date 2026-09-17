package com.kora.service;
import com.kora.dto.request.LoginRequest;
import com.kora.dto.request.RefreshRequest;
import com.kora.dto.request.RegisterRequest;
import com.kora.dto.response.AuthResponse;
import com.kora.dto.response.UserResponse;
import com.kora.entity.RefreshToken;
import com.kora.entity.Role;
import com.kora.entity.User;
import com.kora.exception.ApiException;
import com.kora.exception.EmailAlreadyExistsException;
import com.kora.exception.InvalidCredentialsException;
import com.kora.mapper.UserMapper;
import com.kora.repository.RefreshTokenRepository;
import com.kora.repository.UserRepository;
import com.kora.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;

    @Value("${jwt.refresh-token-expiration}")
    private long refreshExpirationMs;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new EmailAlreadyExistsException(req.email());
        }
        User user = User.builder()
                .email(req.email().toLowerCase())
                .passwordHash(passwordEncoder.encode(req.password()))
                .fullName(req.fullName())
                .phone(req.phone())
                .role(Role.CUSTOMER)
                .emailVerified(false)
                .enabled(true)
                .build();
        user = userRepository.save(user);
        return issueTokens(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest req) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.email(), req.password()));
        } catch (BadCredentialsException e) {
            throw new InvalidCredentialsException();
        }
        User user = userRepository.findByEmail(req.email())
                .orElseThrow(InvalidCredentialsException::new);
        return issueTokens(user);
    }

    @Transactional
    public AuthResponse refresh(RefreshRequest req) {
        RefreshToken rt = refreshTokenRepository.findByToken(req.refreshToken())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid refresh token"));
        if (rt.isRevoked() || rt.getExpiresAt().isBefore(Instant.now())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Refresh token expired or revoked");
        }
        rt.setRevoked(true);
        refreshTokenRepository.save(rt);
        return issueTokens(rt.getUser());
    }

    @Transactional
    public void logout(String email) {
        userRepository.findByEmail(email).ifPresent(refreshTokenRepository::revokeAllByUser);
    }

    @org.springframework.transaction.annotation.Transactional
    public UserResponse updateProfile(String email, com.kora.dto.request.UpdateProfileRequest req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(InvalidCredentialsException::new);
        user.setFullName(req.fullName());
        user.setPhone(req.phone());
        userRepository.save(user);
        return userMapper.toResponse(user);
    }

    @org.springframework.transaction.annotation.Transactional
    public void changePassword(String email, com.kora.dto.request.ChangePasswordRequest req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(InvalidCredentialsException::new);
        if (!passwordEncoder.matches(req.currentPassword(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        userRepository.save(user);
        refreshTokenRepository.revokeAllByUser(user);
    }

    private AuthResponse issueTokens(User user) {
        String access = jwtService.generateAccessToken(user);
        String refresh = UUID.randomUUID().toString() + "-" + UUID.randomUUID();
        RefreshToken rt = RefreshToken.builder()
                .user(user)
                .token(refresh)
                .expiresAt(Instant.now().plusMillis(refreshExpirationMs))
                .revoked(false)
                .build();
        refreshTokenRepository.save(rt);
        UserResponse userResp = userMapper.toResponse(user);
        return new AuthResponse(access, refresh, "Bearer",
                jwtService.getAccessExpirationMs() / 1000, userResp);
    }
}