package com.kora.service;

import com.kora.dto.request.LoginRequest;
import com.kora.dto.request.RegisterRequest;
import com.kora.dto.response.AuthResponse;
import com.kora.dto.response.UserResponse;
import com.kora.entity.Role;
import com.kora.entity.User;
import com.kora.exception.EmailAlreadyExistsException;
import com.kora.mapper.UserMapper;
import com.kora.repository.RefreshTokenRepository;
import com.kora.repository.UserRepository;
import com.kora.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock RefreshTokenRepository refreshTokenRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtService jwtService;
    @Mock AuthenticationManager authenticationManager;
    @Mock UserMapper userMapper;

    @InjectMocks AuthService authService;

    @BeforeEach
    void setup() {
        ReflectionTestUtils.setField(authService, "refreshExpirationMs", 604800000L);
    }

    @Test
    void register_savesUserAndReturnsTokens() {
        // Arrange
        var req = new RegisterRequest("new@kora.test", "Password123!", "New User", "+234801");
        when(userRepository.existsByEmail("new@kora.test")).thenReturn(false);
        when(passwordEncoder.encode("Password123!")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(1L);
            return u;
        });
        when(jwtService.generateAccessToken(any(User.class))).thenReturn("access.jwt");
        when(jwtService.getAccessExpirationMs()).thenReturn(900000L);
        var userResp = new UserResponse(1L, "new@kora.test", "New User", "+234801",
                Role.CUSTOMER, false, Instant.now());
        when(userMapper.toResponse(any(User.class))).thenReturn(userResp);

        // Act
        AuthResponse result = authService.register(req);

        // Assert
        assertThat(result.accessToken()).isEqualTo("access.jwt");
        assertThat(result.refreshToken()).isNotBlank();
        assertThat(result.user().email()).isEqualTo("new@kora.test");
        assertThat(result.user().role()).isEqualTo(Role.CUSTOMER);

        verify(userRepository).save(any(User.class));
        verify(refreshTokenRepository).save(any());
    }

    @Test
    void register_duplicateEmail_throws() {
        when(userRepository.existsByEmail("dup@kora.test")).thenReturn(true);
        var req = new RegisterRequest("dup@kora.test", "Password123!", "Dup User", null);

        assertThatThrownBy(() -> authService.register(req))
                .isInstanceOf(EmailAlreadyExistsException.class);

        verify(userRepository, never()).save(any());
    }

    @Test
    void login_validCredentials_returnsTokens() {
        User user = User.builder()
                .id(2L).email("nathan@kora.test").passwordHash("hashed")
                .fullName("Nathan").role(Role.CUSTOMER).emailVerified(false)
                .enabled(true).build();

        when(authenticationManager.authenticate(any())).thenReturn(null);
        when(userRepository.findByEmail("nathan@kora.test")).thenReturn(java.util.Optional.of(user));
        when(jwtService.generateAccessToken(user)).thenReturn("access.jwt");
        when(jwtService.getAccessExpirationMs()).thenReturn(900000L);
        when(userMapper.toResponse(user)).thenReturn(new UserResponse(2L, "nathan@kora.test",
                "Nathan", null, Role.CUSTOMER, false, Instant.now()));

        var result = authService.login(new LoginRequest("nathan@kora.test", "Password123!"));

        assertThat(result.accessToken()).isEqualTo("access.jwt");
        verify(authenticationManager).authenticate(any());
    }
}