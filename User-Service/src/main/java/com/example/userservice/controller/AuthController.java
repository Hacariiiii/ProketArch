
package com.example.userservice.controller;

import com.example.userservice.dto.*;
import com.example.userservice.service.AuthService;
import com.example.userservice.service.UserService;
import com.example.userservice.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import org.springframework.security.core.context.SecurityContextHolder;


@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private final AuthService authService;
    private final UserService userService;
    private final JwtUtil jwtUtil;

    public AuthController(AuthService authService, UserService userService, JwtUtil jwtUtil) {
        this.authService = authService;
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    // ✅ POST /api/auth/register
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            // Validate input
            if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Username is required"));
            }
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Email is required"));
            }
            if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Password is required"));
            }

            UserDto userDto = authService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(createSuccessResponse(userDto, "User registered successfully"));

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(createErrorResponse(ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Registration failed: " + ex.getMessage()));
        }
    }

    // ✅ POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            // Validate input
            if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Username is required"));
            }
            if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Password is required"));
            }

            LoginResponse loginResponse = authService.login(request);
            return ResponseEntity.ok(createSuccessResponse(loginResponse, "Login successful"));

        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Invalid username or password"));
        }
    }

    // ✅ POST /api/auth/refresh
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody RefreshTokenRequest request) {
        try {
            if (request.getRefreshToken() == null || request.getRefreshToken().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Refresh token is required"));
            }

            LoginResponse loginResponse = authService.refreshAccessToken(request);
            return ResponseEntity.ok(createSuccessResponse(loginResponse, "Token refreshed successfully"));

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Invalid or expired refresh token"));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Token refresh failed: " + ex.getMessage()));
        }
    }

    // ✅ POST /api/auth/logout
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String token) {
        try {
            String jwt = extractJwtFromRequest(token);
            if (jwt == null || !authService.validateToken(jwt)) {
                return ResponseEntity.badRequest().body(createErrorResponse("Invalid token"));
            }

            Long userId = authService.getUserIdFromToken(jwt);
            authService.logout(userId);
            return ResponseEntity.ok(createSuccessResponse(null, "Logged out successfully"));

        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Logout failed: " + ex.getMessage()));
        }
    }

    // ✅ GET /api/auth/validate
    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String token) {
        try {
            String jwt = extractJwtFromRequest(token);
            if (jwt == null) {
                return ResponseEntity.badRequest().body(createErrorResponse("No token provided"));
            }

            boolean isValid = authService.validateToken(jwt);
            if (isValid) {
                Long userId = authService.getUserIdFromToken(jwt);
                String username = authService.getUsernameFromToken(jwt);
                Map<String, Object> data = new HashMap<>();
                data.put("userId", userId);
                data.put("username", username);
                data.put("valid", true);
                return ResponseEntity.ok(createSuccessResponse(data, "Token is valid"));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("Token is invalid or expired"));
            }

        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Token validation failed: " + ex.getMessage()));
        }
    }

    // ✅ GET /api/auth/me (Get current user info - FIXED)
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String token) {
        try {
            String jwt = extractJwtFromRequest(token);
            if (jwt == null || !authService.validateToken(jwt)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("Invalid or missing token"));
            }

            Long userId = authService.getUserIdFromToken(jwt);
            UserDto userDto = userService.getUserById(userId);  // ✅ FIXED: Call userService.getUserById()

            return ResponseEntity.ok(createSuccessResponse(userDto, "User info retrieved successfully"));

        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to retrieve user info: " + ex.getMessage()));
        }
    }

    // 🛠️ Helper method to extract JWT from Authorization header
    private String extractJwtFromRequest(String bearerToken) {
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    // 🛠️ Helper method to create success response
    private Map<String, Object> createSuccessResponse(Object data, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("data", data);
        return response;
    }

    // 🛠️ Helper method to create error response
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        response.put("data", null);
        return response;
    }


    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateProfileRequest request) {
        try {
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Email is required"));
            }

            // get username from JWT
            String username = SecurityContextHolder.getContext().getAuthentication().getName();

            UserDto updatedUser = userService.updateUserProfile(username, request.getEmail());

            return ResponseEntity.ok(
                    createSuccessResponse(updatedUser, "Profile updated successfully")
            );

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(createErrorResponse(ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to update profile: " + ex.getMessage()));
        }
    }


    // =====================================
    // CHANGE PASSWORD
    // =====================================
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        try {

            if (request.getOldPassword() == null || request.getOldPassword().isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Old password is required"));
            }

            if (request.getNewPassword() == null || request.getNewPassword().isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("New password is required"));
            }

            if (request.getNewPassword().length() < 6) {
                return ResponseEntity.badRequest().body(createErrorResponse("New password must be at least 6 characters"));
            }

            // get username from JWT
            String username = SecurityContextHolder.getContext().getAuthentication().getName();

            userService.changePassword(username, request.getOldPassword(), request.getNewPassword());

            return ResponseEntity.ok(
                    createSuccessResponse(null, "Password changed successfully")
            );

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(createErrorResponse(ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to change password: " + ex.getMessage()));
        }
    }


}