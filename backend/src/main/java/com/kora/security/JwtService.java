package com.kora.security;

import com.kora.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private static final String FALLBACK_SECRET =
            "kora-prod-fallback-secret-must-be-64-bytes-or-longer-padding-here-to-be-safe-xx";
    private static final int MIN_KEY_BYTES = 64;

    private final SecretKey key;
    private final long accessExpiration;

    public JwtService(
            @Value("${jwt.secret:}") String secret,
            @Value("${jwt.access-token-expiration:7200000}") long accessExpiration) {
        String effective = (secret == null || secret.isBlank()) ? FALLBACK_SECRET : secret;
        byte[] raw = effective.getBytes(StandardCharsets.UTF_8);
        if (raw.length < MIN_KEY_BYTES) {
            // Pad to at least 64 bytes so HMAC-SHA512 always accepts it
            StringBuilder sb = new StringBuilder(effective);
            while (sb.length() < MIN_KEY_BYTES) sb.append('x');
            raw = sb.toString().getBytes(StandardCharsets.UTF_8);
        }
        this.key = Keys.hmacShaKeyFor(raw);
        this.accessExpiration = accessExpiration;
    }

    public String generateAccessToken(User user) {
        Date now = new Date();
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("userId", user.getId())
                .claim("role", user.getRole().name())
                .issuedAt(now)
                .expiration(new Date(now.getTime() + accessExpiration))
                .signWith(key)
                .compact();
    }

    public String extractEmail(String token) {
        return parse(token).getSubject();
    }

    public boolean isValid(String token) {
        try {
            parse(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public long getAccessExpirationMs() {
        return accessExpiration;
    }

    private Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}