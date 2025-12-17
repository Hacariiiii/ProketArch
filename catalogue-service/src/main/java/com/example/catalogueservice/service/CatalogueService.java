package com.example.catalogueservice.service;

import com.example.catalogueservice.dto.*;
import com.example.catalogueservice.entity.*;
import com.example.catalogueservice.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CatalogueService {

    private final UserOrderHistoryRepository orderHistoryRepository;
    private final UserProfileRepository userProfileRepository;

    @Transactional
    public UserOrderHistoryResponse recordOrderHistory(OrderHistoryRequest request) {
        log.info("📝 Recording order history for user: {}, order: {}",
                request.getUserId(), request.getOrderNumber());

        log.info("📦 Received {} items",
                request.getItems() != null ? request.getItems().size() : 0);

        // ⚠️⚠️⚠️ CORRECTION CRITIQUE ⚠️⚠️⚠️
        // Vérifie que orderDate n'est pas null
        LocalDateTime orderDate = request.getOrderDate();
        if (orderDate == null) {
            orderDate = LocalDateTime.now();
            log.warn("⚠️ Order date was null, using current date: {}", orderDate);
        }

        log.info("📅 Using order date: {}", orderDate);

        // Check if order already exists
        if (orderHistoryRepository.findByOrderNumber(request.getOrderNumber()).isPresent()) {
            log.warn("⚠️ Order {} already exists in catalogue", request.getOrderNumber());
            throw new IllegalArgumentException("Order already recorded: " + request.getOrderNumber());
        }

        // Build order history avec date garantie
        UserOrderHistory history = UserOrderHistory.builder()
                .userId(request.getUserId())
                .userName(request.getUserName() != null ? request.getUserName() : "Unknown")
                .userEmail(request.getUserEmail() != null ? request.getUserEmail() : "unknown@example.com")
                .orderNumber(request.getOrderNumber())
                .shippingAddress(request.getShippingAddress() != null ? request.getShippingAddress() : "No address")
                .orderStatus(request.getStatus() != null ? request.getStatus() : "PENDING")
                .totalAmount(request.getTotalAmount() != null ? request.getTotalAmount() : BigDecimal.ZERO)
                .orderDate(orderDate)  // ⬅️ DATE GARANTIE NON NULL
                .build();

        log.info("📊 Order built with date: {}", history.getOrderDate());

        // Add items
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (OrderItemDto itemDto : request.getItems()) {
                // Validation des items
                if (itemDto.getProductId() == null) {
                    log.warn("⚠️ Item missing productId, skipping");
                    continue;
                }

                OrderHistoryItem item = OrderHistoryItem.builder()
                        .productId(itemDto.getProductId())
                        .productName(itemDto.getProductName() != null ? itemDto.getProductName() : "Unknown Product")
                        .quantity(itemDto.getQuantity() != null ? itemDto.getQuantity() : 1)
                        .unitPrice(itemDto.getUnitPrice() != null ? itemDto.getUnitPrice() : BigDecimal.ZERO)
                        .totalPrice(itemDto.getTotalPrice() != null ? itemDto.getTotalPrice() : BigDecimal.ZERO)
                        .build();
                history.addItem(item);
            }
            log.info("✅ Added {} items to order {}",
                    request.getItems().size(), request.getOrderNumber());
        } else {
            log.warn("⚠️ No items received for order {}", request.getOrderNumber());
        }

        try {
            UserOrderHistory savedHistory = orderHistoryRepository.save(history);
            log.info("💾 Order saved with ID: {}, date: {}",
                    savedHistory.getId(), savedHistory.getOrderDate());

            // Update user profile
            updateUserProfile(
                    request.getUserId(),
                    request.getTotalAmount() != null ? request.getTotalAmount() : BigDecimal.ZERO,
                    orderDate,  // ⬅️ Utilise la date garantie
                    request.getUserName(),
                    request.getUserEmail()
            );

            log.info("✅ Order history recorded successfully: {}", savedHistory.getOrderNumber());
            return convertToResponse(savedHistory);

        } catch (Exception ex) {
            log.error("❌ Failed to save order: {}", ex.getMessage());
            throw new RuntimeException("Failed to save order: " + ex.getMessage(), ex);
        }
    }

    @Transactional
    public void updateUserProfile(Long userId, BigDecimal orderAmount,
                                  LocalDateTime orderDate, String userName, String userEmail) {
        // ⚠️ Vérifie que orderDate n'est pas null
        if (orderDate == null) {
            orderDate = LocalDateTime.now();
            log.warn("⚠️ Profile update: orderDate was null, using current date");
        }

        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElse(UserProfile.builder()
                        .userId(userId)
                        .name(userName != null ? userName : "Unknown User")
                        .email(userEmail != null ? userEmail : "unknown@example.com")
                        .totalOrders(0)
                        .totalSpent(BigDecimal.ZERO)
                        .build());

        profile.setTotalOrders(profile.getTotalOrders() + 1);
        profile.setTotalSpent(profile.getTotalSpent().add(
                orderAmount != null ? orderAmount : BigDecimal.ZERO));
        profile.setLastOrderDate(orderDate);  // ⬅️ DATE GARANTIE

        if (userName != null && profile.getName() == null) {
            profile.setName(userName);
        }
        if (userEmail != null && profile.getEmail() == null) {
            profile.setEmail(userEmail);
        }

        userProfileRepository.save(profile);
        log.info("📊 Updated profile for user {}: total orders={}, total spent={}, last order={}",
                userId, profile.getTotalOrders(), profile.getTotalSpent(), profile.getLastOrderDate());
    }

    // ... reste des méthodes (elles sont correctes) ...

    private UserOrderHistoryResponse convertToResponse(UserOrderHistory history) {
        List<OrderItemDto> items = history.getItems().stream()
                .map(item -> OrderItemDto.builder()
                        .productId(item.getProductId())
                        .productName(item.getProductName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .totalPrice(item.getTotalPrice())
                        .build())
                .collect(Collectors.toList());

        return UserOrderHistoryResponse.builder()
                .id(history.getId())
                .userId(history.getUserId())
                .userName(history.getUserName())
                .userEmail(history.getUserEmail())
                .orderNumber(history.getOrderNumber())
                .shippingAddress(history.getShippingAddress())
                .orderStatus(history.getOrderStatus())
                .totalAmount(history.getTotalAmount())
                .orderDate(history.getOrderDate())
                .recordedAt(history.getRecordedAt())
                .items(items)
                .build();
    }

    private UserProfileResponse convertToProfileResponse(UserProfile profile) {
        return UserProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUserId())
                .name(profile.getName())
                .email(profile.getEmail())
                .phone(profile.getPhone())
                .address(profile.getAddress())
                .totalOrders(profile.getTotalOrders())
                .totalSpent(profile.getTotalSpent())
                .lastOrderDate(profile.getLastOrderDate())
                .build();
    }
}