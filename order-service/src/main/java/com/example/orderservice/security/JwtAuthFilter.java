package com.example.orderservice.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.io.IOException;

public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthFilter.class);
    private final JwtUtil jwtUtil;

    public JwtAuthFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        logger.info("🔍 Processing request: {} {}", request.getMethod(), path);

        try {
            String token = getTokenFromRequest(request);

            if (token == null) {
                logger.warn("⚠️ No token found in Authorization header");
            } else {
                logger.debug("🔑 Token found: {}", token.substring(0, 20) + "...");

                if (jwtUtil.validateToken(token)) {
                    Long userId = jwtUtil.getUserIdFromToken(token);
                    String username = jwtUtil.getUsernameFromToken(token);

                    logger.info("✅ Token validated - userId: {}, username: {}", userId, username);

                    if (userId != null) {
                        request.setAttribute("userId", userId);
                        logger.info("✅ userId set in request attribute: {}", userId);
                    } else {
                        logger.error("❌ userId is null after extraction!");
                    }
                } else {
                    logger.error("❌ Token validation failed");
                }
            }
        } catch (Exception ex) {
            logger.error("❌ JWT error: {}", ex.getMessage(), ex);
        }

        filterChain.doFilter(request, response);
    }

    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        logger.debug("Authorization header: {}", bearerToken);

        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
            logger.debug("✅ Extracted token from Authorization header");
            return token;
        }

        logger.warn("⚠️ No Bearer token in Authorization header");
        return null;
    }
}