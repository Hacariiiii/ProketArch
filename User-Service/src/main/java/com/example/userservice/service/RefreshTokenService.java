package com.example.userservice.service;

import com.example.userservice.entity.RefreshToken;
import com.example.userservice.exception.ResourceNotFoundException;
import com.example.userservice.repository.RefreshTokenRepository;
import com.example.userservice.security.JwtUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Date;

@Service
@Transactional
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtUtil jwtUtil;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository, JwtUtil jwtUtil) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtUtil = jwtUtil;
    }

    // ✅ Create refresh token
    public RefreshToken createRefreshToken(Long userId, String token) {
        // Delete old refresh token if exists
        refreshTokenRepository.findByUserId(userId).ifPresent(refreshTokenRepository::delete);

        // Create new refresh token with 7 days expiration
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUserId(userId);
        refreshToken.setToken(token);
        refreshToken.setExpiryDate(new Date(System.currentTimeMillis() + 7 * 24 * 60 * 60 * 1000)); // 7 days

        return refreshTokenRepository.save(refreshToken);
    }

    // ✅ Verify refresh token
    public RefreshToken verifyRefreshToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Refresh token not found"));

        // Check if token is expired
        if (refreshToken.getExpiryDate().before(new Date())) {
            refreshTokenRepository.delete(refreshToken);
            throw new IllegalArgumentException("Refresh token has expired");
        }

        // Validate JWT structure
        if (!jwtUtil.validateToken(token)) {
            throw new IllegalArgumentException("Invalid refresh token");
        }

        return refreshToken;
    }

    // ✅ Delete refresh token
    public void deleteRefreshToken(Long userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }

    // ✅ Get refresh token by user ID
    public RefreshToken getRefreshTokenByUserId(Long userId) {
        return refreshTokenRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Refresh token not found for user: " + userId));
    }
}