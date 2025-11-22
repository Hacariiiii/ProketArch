package com.example.userservice.service;

import com.example.userservice.dto.*;
import com.example.userservice.entity.User;
import com.example.userservice.entity.RefreshToken;
import com.example.userservice.exception.ResourceNotFoundException;
import com.example.userservice.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@Transactional
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserService userService;
    private final RefreshTokenService refreshTokenService;

    public AuthService(AuthenticationManager authenticationManager, JwtUtil jwtUtil,
                       UserService userService, RefreshTokenService refreshTokenService) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userService = userService;
        this.refreshTokenService = refreshTokenService;
    }

    // ✅ Register user
    public UserDto register(RegisterRequest request) {
        logger.info("📝 Register attempt for username: {}", request.getUsername());

        // Validate passwords match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            logger.warn("⚠️ Passwords do not match for: {}", request.getUsername());
            throw new IllegalArgumentException("Passwords do not match");
        }

        // Validate password strength (optional)
        if (request.getPassword().length() < 6) {
            logger.warn("⚠️ Password too short for: {}", request.getUsername());
            throw new IllegalArgumentException("Password must be at least 6 characters long");
        }

        UserDto userDto = userService.registerUser(request.getUsername(), request.getEmail(), request.getPassword());
        logger.info("✅ User registered successfully: {}", userDto.getUsername());
        return userDto;
    }

    // ✅ Login user (FIXED WITH LOGGING)
    public LoginResponse login(LoginRequest request) {
        logger.info("🔐 Login attempt for username: {}", request.getUsername());

        try {
            // Authenticate user
            logger.debug("🔑 Authenticating credentials for: {}", request.getUsername());
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );

            logger.info("✅ Authentication successful for: {}", request.getUsername());

            // Get user details
            User user = userService.findByUsername(request.getUsername());
            logger.info("👤 User found: ID={}, Username={}, Email={}",
                    user.getId(), user.getUsername(), user.getEmail());

            // Generate tokens
            String accessToken = jwtUtil.generateAccessToken(user.getUsername(), user.getId());
            String refreshToken = jwtUtil.generateRefreshToken(user.getUsername(), user.getId());

            logger.debug("🎫 Tokens generated for user: {}", user.getId());

            // Save refresh token to database
            refreshTokenService.createRefreshToken(user.getId(), refreshToken);
            logger.info("💾 Refresh token saved to DB for user: {}", user.getId());

            // Return login response
            LoginResponse response = new LoginResponse(
                    accessToken,
                    refreshToken,
                    user.getId(),
                    user.getUsername(),
                    user.getEmail()
            );

            logger.info("🎉 Login successful for user: {}", request.getUsername());
            return response;

        } catch (BadCredentialsException ex) {
            logger.error("❌ Bad credentials for username: {}", request.getUsername());
            throw new BadCredentialsException("Invalid username or password");
        } catch (Exception ex) {
            logger.error("❌ Login error for {}: {}", request.getUsername(), ex.getMessage(), ex);
            throw new BadCredentialsException("Invalid username or password");
        }
    }

    // ✅ Refresh access token
    public LoginResponse refreshAccessToken(RefreshTokenRequest request) {
        logger.info("🔄 Refresh token attempt");

        try {
            // Verify refresh token
            RefreshToken refreshToken = refreshTokenService.verifyRefreshToken(request.getRefreshToken());
            logger.debug("✅ Refresh token verified");

            // Get user info
            User user = userService.findByUsername(jwtUtil.getUsernameFromToken(request.getRefreshToken()));

            // Generate new access token
            String newAccessToken = jwtUtil.generateAccessToken(user.getUsername(), user.getId());
            logger.info("🎫 New access token generated for user: {}", user.getId());

            return new LoginResponse(
                    newAccessToken,
                    request.getRefreshToken(),
                    user.getId(),
                    user.getUsername(),
                    user.getEmail()
            );
        } catch (Exception ex) {
            logger.error("❌ Refresh token error: {}", ex.getMessage(), ex);
            throw ex;
        }
    }

    // ✅ Logout user
    public void logout(Long userId) {
        logger.info("👋 Logout for user: {}", userId);
        refreshTokenService.deleteRefreshToken(userId);
        logger.info("✅ Logout successful for user: {}", userId);
    }

    // ✅ Validate token
    public boolean validateToken(String token) {
        return jwtUtil.validateToken(token);
    }

    // ✅ Get user ID from token
    public Long getUserIdFromToken(String token) {
        return jwtUtil.getUserIdFromToken(token);
    }

    // ✅ Get username from token
    public String getUsernameFromToken(String token) {
        return jwtUtil.getUsernameFromToken(token);
    }
}




