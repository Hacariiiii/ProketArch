package com.example.userservice.service;

import com.example.userservice.dto.UserDto;
import com.example.userservice.entity.User;
import com.example.userservice.entity.Role;
import com.example.userservice.exception.ResourceNotFoundException;
import com.example.userservice.repository.UserRepository;
import com.example.userservice.repository.RoleRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ✅ Register new user
    public UserDto registerUser(String username, String email, String password) {
        // Check if user already exists
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username already exists: " + username);
        }
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already exists: " + email);
        }

        // Create new user
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setCreatedAt(new Date());

        // Assign default USER role
        Role userRole = roleRepository.findByName("USER")
                .orElseThrow(() -> new ResourceNotFoundException("USER role not found"));
        user.setRoles(new HashSet<>(Collections.singletonList(userRole)));

        User savedUser = userRepository.save(user);
        return convertToDto(savedUser);
    }

    // ✅ Find user by username
    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    // ✅ Find user by ID
    public UserDto getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        return convertToDto(user);
    }

    // ✅ Get user info (for profile)
    public UserDto getUserInfo(Long userId) {
        return getUserById(userId);
    }

    // ✅ Update user profile
    public UserDto updateUserProfile(String username, String email) {
        User user = findByUsername(username);

        // Check if email already exists (for other users)
        if (!user.getEmail().equals(email) && userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already exists: " + email);
        }

        user.setEmail(email);
        User updatedUser = userRepository.save(user);
        return convertToDto(updatedUser);
    }
    // ✅ Change password
    public void changePassword(String username, String oldPassword, String newPassword) {
        User user = findByUsername(username);

        // Verify old password
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new IllegalArgumentException("Old password is incorrect");
        }

        // Check if new password is same as old
        if (oldPassword.equals(newPassword)) {
            throw new IllegalArgumentException("New password must be different from old password");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }


    // ✅ Convert User to UserDto
    private UserDto convertToDto(User user) {
        Set<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());
        return new UserDto(user.getId(), user.getUsername(), user.getEmail(), roles);
    }

    // ✅ Get all users (for admin only)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // ✅ Delete user (for admin only)
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with ID: " + userId);
        }
        userRepository.deleteById(userId);
    }
}