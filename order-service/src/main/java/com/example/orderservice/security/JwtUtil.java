package com.example.orderservice.security;

import io.jsonwebtoken.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Date;

@Component
public class JwtUtil {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    @Value("${jwt.secret:GJHs7d92JH9a8sdGHJ9as8d7JhA92jd8HJASD89a7sd98AHSD98ahs9d8ASD98asd7A9S8d7aS9d8as7d98ASD7asd}")
    private String jwtSecret;

    @Value("${jwt.expiration:900000}")
    private long jwtExpirationInMs;

    // ✅ Generate Access Token (SAME AS USER SERVICE)
    public String generateAccessToken(String username, Long userId) {
        return Jwts.builder()
                .setSubject(username)
                .claim("userId", userId)
                .claim("type", "ACCESS")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationInMs))
                .signWith(SignatureAlgorithm.HS256, jwtSecret)
                .compact();
    }

    // ✅ Generate Refresh Token (SAME AS USER SERVICE)
    public String generateRefreshToken(String username, Long userId) {
        return Jwts.builder()
                .setSubject(username)
                .claim("userId", userId)
                .claim("type", "REFRESH")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 604800000))
                .signWith(SignatureAlgorithm.HS256, jwtSecret)
                .compact();
    }

    // ✅ Extract username from token
    public String getUsernameFromToken(String token) {
        try {
            return Jwts.parser()
                    .setSigningKey(jwtSecret)
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject();
        } catch (Exception ex) {
            logger.error("❌ Error extracting username: {}", ex.getMessage());
            return null;
        }
    }

    // ✅ Extract userId from token
    public Long getUserIdFromToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .setSigningKey(jwtSecret)
                    .parseClaimsJws(token)
                    .getBody();
            Object userIdObj = claims.get("userId");
            return userIdObj != null ? Long.parseLong(userIdObj.toString()) : null;
        } catch (Exception ex) {
            logger.error("❌ Error extracting userId: {}", ex.getMessage());
            return null;
        }
    }

    // ✅ Validate token
    public boolean validateToken(String token) {
        try {
            if (token == null || token.isEmpty()) {
                logger.warn("⚠️ Token is null or empty");
                return false;
            }
            Jwts.parser()
                    .setSigningKey(jwtSecret)
                    .parseClaimsJws(token);
            logger.debug("✅ Token is valid");
            return true;
        } catch (ExpiredJwtException ex) {
            logger.error("❌ Token expired");
            return false;
        } catch (SignatureException ex) {
            logger.error("❌ Invalid signature - JWT_SECRET mismatch!");
            return false;
        } catch (JwtException | IllegalArgumentException ex) {
            logger.error("❌ Invalid token: {}", ex.getMessage());
            return false;
        }
    }

    // ✅ Check if token is expired
    public boolean isTokenExpired(String token) {
        try {
            Date expiration = Jwts.parser()
                    .setSigningKey(jwtSecret)
                    .parseClaimsJws(token)
                    .getBody()
                    .getExpiration();
            return expiration.before(new Date());
        } catch (Exception ex) {
            logger.error("❌ Error checking expiration: {}", ex.getMessage());
            return true;
        }
    }
}