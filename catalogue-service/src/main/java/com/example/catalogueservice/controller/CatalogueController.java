package com.example.catalogueservice.controller;

import com.example.catalogueservice.dto.*;
import com.example.catalogueservice.entity.*;
import com.example.catalogueservice.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/catalogue")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CatalogueController {

    private static final Logger log = LoggerFactory.getLogger(CatalogueController.class);

    private final UserOrderHistoryRepository orderHistoryRepository;
    private final OrderHistoryItemRepository orderItemRepository;
    private final UserProfileRepository userProfileRepository;

    /* =======================
       POST ORDER
    ======================= */
    @PostMapping("/orders")
    @Transactional
    public ResponseEntity<?> recordOrder(@RequestBody Map<String, Object> requestMap) {
        try {
            log.info("📥 Received order request: {}", requestMap);

            // Vérifie orderDate
            LocalDateTime orderDate = null;
            if (requestMap.get("orderDate") != null) {
                Object orderDateObj = requestMap.get("orderDate");
                if (orderDateObj instanceof String) {
                    orderDate = LocalDateTime.parse((String) orderDateObj);
                }
            }
            if (orderDate == null) {
                orderDate = LocalDateTime.now();
                log.warn("⚠️ Order date was null, using current date: {}", orderDate);
            }

            // Récupère les données de base
            Long userId = requestMap.get("userId") != null
                    ? ((Number) requestMap.get("userId")).longValue() : null;
            String userName = (String) requestMap.get("userName");
            String userEmail = (String) requestMap.get("userEmail");
            String orderNumber = (String) requestMap.get("orderNumber");
            String shippingAddress = (String) requestMap.get("shippingAddress");
            String status = requestMap.get("status") != null
                    ? (String) requestMap.get("status") : "PENDING";

            // Gère totalAmount
            BigDecimal totalAmount = BigDecimal.ZERO;
            if (requestMap.get("totalAmount") != null) {
                Object totalAmountObj = requestMap.get("totalAmount");
                if (totalAmountObj instanceof Number) {
                    totalAmount = BigDecimal.valueOf(((Number) totalAmountObj).doubleValue());
                } else if (totalAmountObj instanceof String) {
                    totalAmount = new BigDecimal((String) totalAmountObj);
                }
            }

            // Check if order already exists
            if (orderHistoryRepository.findByOrderNumber(orderNumber).isPresent()) {
                log.warn("⚠️ Order {} already exists", orderNumber);
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("error", "Order already recorded: " + orderNumber));
            }

            // Crée l'entité UserOrderHistory
            UserOrderHistory orderHistory = UserOrderHistory.builder()
                    .userId(userId)
                    .userName(userName != null ? userName : "Unknown")
                    .userEmail(userEmail != null ? userEmail : "unknown@example.com")
                    .orderNumber(orderNumber)
                    .shippingAddress(shippingAddress != null ? shippingAddress : "No address")
                    .orderStatus(status)
                    .totalAmount(totalAmount)
                    .orderDate(orderDate)
                    .recordedAt(LocalDateTime.now())
                    .build();

            log.info("📊 Order built with date: {}", orderHistory.getOrderDate());

            // Sauvegarde l'order principal
            UserOrderHistory savedOrder = orderHistoryRepository.save(orderHistory);
            log.info("✅ Order saved with ID: {}", savedOrder.getId());

            // Gère les items
            List<OrderHistoryItem> items = new ArrayList<>();
            Object itemsObj = requestMap.get("items");

            if (itemsObj instanceof List) {
                List<?> itemsList = (List<?>) itemsObj;
                log.info("📦 Processing {} items", itemsList.size());

                for (Object itemObj : itemsList) {
                    if (itemObj instanceof Map) {
                        Map<?, ?> itemMap = (Map<?, ?>) itemObj;

                        if (itemMap.get("productId") == null) {
                            log.warn("⚠️ Item missing productId, skipping");
                            continue;
                        }

                        OrderHistoryItem item = OrderHistoryItem.builder()
                                .orderHistory(savedOrder)
                                .productId(((Number) itemMap.get("productId")).longValue())
                                .productName(itemMap.get("productName") != null
                                        ? (String) itemMap.get("productName") : "Unknown Product")
                                .quantity(itemMap.get("quantity") != null
                                        ? ((Number) itemMap.get("quantity")).intValue() : 1)
                                .build();

                        // Gère unitPrice
                        Object unitPriceObj = itemMap.get("unitPrice");
                        if (unitPriceObj instanceof Number) {
                            item.setUnitPrice(BigDecimal.valueOf(((Number) unitPriceObj).doubleValue()));
                        } else {
                            item.setUnitPrice(BigDecimal.ZERO);
                        }

                        // Gère totalPrice
                        Object totalPriceObj = itemMap.get("totalPrice");
                        if (totalPriceObj instanceof Number) {
                            item.setTotalPrice(BigDecimal.valueOf(((Number) totalPriceObj).doubleValue()));
                        } else {
                            item.setTotalPrice(BigDecimal.ZERO);
                        }

                        items.add(item);
                    }
                }

                // Sauvegarde tous les items
                if (!items.isEmpty()) {
                    orderItemRepository.saveAll(items);
                    log.info("✅ Saved {} items", items.size());
                }
            } else {
                log.warn("⚠️ No items received for order {}", orderNumber);
            }

            // Update user profile
            updateUserProfile(userId, totalAmount, orderDate, userName, userEmail);

            // Prépare la réponse
            UserOrderHistoryResponse response = convertToResponse(savedOrder, items);
            log.info("✅ Order recorded successfully: {}", savedOrder.getOrderNumber());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception ex) {
            log.error("❌ Error recording order: {}", ex.getMessage(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to record order: " + ex.getMessage()));
        }
    }

    /* =======================
       USER ENDPOINTS
    ======================= */
    @GetMapping("/users/{userId}/history")
    public ResponseEntity<?> getUserOrderHistory(@PathVariable Long userId) {
        try {
            List<UserOrderHistory> orders = orderHistoryRepository.findByUserIdOrderByOrderDateDesc(userId);

            List<UserOrderHistoryResponse> response = orders.stream()
                    .map(order -> convertToResponse(order, order.getItems()))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            log.error("❌ Error fetching user history: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/users/{userId}/summary")
    public ResponseEntity<?> getUserOrderSummary(@PathVariable Long userId) {
        try {
            // Récupère le profil
            Optional<UserProfile> profileOpt = userProfileRepository.findByUserId(userId);

            if (profileOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "No profile found for user"));
            }

            UserProfile profile = profileOpt.get();
            List<UserOrderHistory> orders = orderHistoryRepository.findByUserIdOrderByOrderDateDesc(userId);

            // Prépare la réponse
            Map<String, Object> profileData = Map.of(
                    "userId", profile.getUserId(),
                    "name", profile.getName() != null ? profile.getName() : "Unknown",
                    "email", profile.getEmail() != null ? profile.getEmail() : "",
                    "totalOrders", profile.getTotalOrders(),
                    "totalSpent", profile.getTotalSpent(),
                    "lastOrderDate", profile.getLastOrderDate()
            );

            List<UserOrderHistoryResponse> orderHistory = orders.stream()
                    .map(order -> convertToResponse(order, order.getItems()))
                    .collect(Collectors.toList());

            Map<String, Object> response = Map.of(
                    "profile", profileData,
                    "orderHistory", orderHistory
            );

            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            log.error("❌ Error fetching user summary: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/users/{userId}/history/date-range")
    public ResponseEntity<?> getUserOrdersByDateRange(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            List<UserOrderHistory> orders = orderHistoryRepository.findByUserIdAndOrderDateBetween(
                    userId, startDate, endDate);

            List<UserOrderHistoryResponse> response = orders.stream()
                    .map(order -> convertToResponse(order, order.getItems()))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of("orders", response));
        } catch (Exception ex) {
            log.error("❌ Error fetching orders by date range: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", ex.getMessage()));
        }
    }

    /* =======================
       MY ORDERS (Current User)
    ======================= */
    @GetMapping("/my-history")
    public ResponseEntity<?> getMyOrderHistory() {
        try {
            // TODO: Récupérer userId depuis JWT token
            // Pour l'instant, retourne toutes les commandes
            List<UserOrderHistory> orders = orderHistoryRepository.findAll();

            List<UserOrderHistoryResponse> response = orders.stream()
                    .map(order -> convertToResponse(order, order.getItems()))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of("history", response));
        } catch (Exception ex) {
            log.error("❌ Error fetching my history: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/my-summary")
    public ResponseEntity<?> getMyOrderSummary() {
        try {
            // TODO: Récupérer userId depuis JWT
            List<UserOrderHistory> orders = orderHistoryRepository.findAll();

            if (orders.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                        "profile", Map.of(
                                "totalOrders", 0,
                                "totalSpent", BigDecimal.ZERO
                        ),
                        "orderHistory", List.of()
                ));
            }

            // Calcule les stats
            long totalOrders = orders.size();
            BigDecimal totalSpent = orders.stream()
                    .map(UserOrderHistory::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            List<UserOrderHistoryResponse> orderHistory = orders.stream()
                    .map(order -> convertToResponse(order, order.getItems()))
                    .collect(Collectors.toList());

            Map<String, Object> response = Map.of(
                    "profile", Map.of(
                            "totalOrders", totalOrders,
                            "totalSpent", totalSpent,
                            "lastOrderDate", orders.get(0).getOrderDate()
                    ),
                    "orderHistory", orderHistory
            );

            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            log.error("❌ Error fetching my summary: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/my-history/status/{status}")
    public ResponseEntity<?> getMyOrdersByStatus(@PathVariable String status) {
        try {
            List<UserOrderHistory> orders = orderHistoryRepository.findByOrderStatus(status);

            List<UserOrderHistoryResponse> response = orders.stream()
                    .map(order -> convertToResponse(order, order.getItems()))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of("orders", response));
        } catch (Exception ex) {
            log.error("❌ Error fetching orders by status: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/my-history/date-range")
    public ResponseEntity<?> getMyOrdersByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            // TODO: Filter by current user
            List<UserOrderHistory> orders = orderHistoryRepository.findAll().stream()
                    .filter(o -> o.getOrderDate().isAfter(startDate) && o.getOrderDate().isBefore(endDate))
                    .collect(Collectors.toList());

            List<UserOrderHistoryResponse> response = orders.stream()
                    .map(order -> convertToResponse(order, order.getItems()))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of("orders", response));
        } catch (Exception ex) {
            log.error("❌ Error fetching orders by date range: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", ex.getMessage()));
        }
    }

    /* =======================
       ADMIN ENDPOINTS
    ======================= */
    @GetMapping("/orders/all")
    public ResponseEntity<?> getAllOrderHistory() {
        try {
            List<UserOrderHistory> orders = orderHistoryRepository.findAll();
            orders.sort((a, b) -> b.getOrderDate().compareTo(a.getOrderDate()));

            List<UserOrderHistoryResponse> response = orders.stream()
                    .map(order -> convertToResponse(order, order.getItems()))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of("orders", response));
        } catch (Exception ex) {
            log.error("❌ Error fetching all orders: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/orders/{orderNumber}")
    public ResponseEntity<?> getOrderByNumber(@PathVariable String orderNumber) {
        try {
            Optional<UserOrderHistory> orderOpt = orderHistoryRepository.findByOrderNumber(orderNumber);

            if (orderOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Order not found"));
            }

            UserOrderHistory order = orderOpt.get();
            UserOrderHistoryResponse response = convertToResponse(order, order.getItems());
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            log.error("❌ Error fetching order: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/orders/status/{status}")
    public ResponseEntity<?> getOrdersByStatus(@PathVariable String status) {
        try {
            List<UserOrderHistory> orders = orderHistoryRepository.findByOrderStatus(status);
            orders.sort((a, b) -> b.getOrderDate().compareTo(a.getOrderDate()));

            List<UserOrderHistoryResponse> response = orders.stream()
                    .map(order -> convertToResponse(order, order.getItems()))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of("orders", response));
        } catch (Exception ex) {
            log.error("❌ Error fetching orders by status: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", ex.getMessage()));
        }
    }

    /* =======================
       STATISTICS
    ======================= */
    @GetMapping("/statistics")
    public ResponseEntity<?> getGlobalStatistics() {
        try {
            List<UserOrderHistory> allOrders = orderHistoryRepository.findAll();

            long totalOrders = allOrders.size();
            BigDecimal totalRevenue = allOrders.stream()
                    .map(UserOrderHistory::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            long uniqueCustomers = allOrders.stream()
                    .map(UserOrderHistory::getUserId)
                    .filter(Objects::nonNull)
                    .distinct()
                    .count();

            BigDecimal averageOrderValue = totalOrders > 0
                    ? totalRevenue.divide(BigDecimal.valueOf(totalOrders), 2, BigDecimal.ROUND_HALF_UP)
                    : BigDecimal.ZERO;

            Map<String, Object> stats = Map.of(
                    "totalOrders", totalOrders,
                    "totalRevenue", totalRevenue,
                    "uniqueCustomers", uniqueCustomers,
                    "averageOrderValue", averageOrderValue
            );

            return ResponseEntity.ok(stats);
        } catch (Exception ex) {
            log.error("❌ Error fetching statistics: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", ex.getMessage()));
        }
    }

    /* =======================
       HEALTH CHECK
    ======================= */
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "catalogue-service",
                "timestamp", LocalDateTime.now(),
                "message", "Catalogue service is running"
        ));
    }

    /* =======================
       HELPER METHODS
    ======================= */
    @Transactional
    private void updateUserProfile(Long userId, BigDecimal orderAmount,
                                   LocalDateTime orderDate, String userName, String userEmail) {
        if (userId == null) {
            log.warn("⚠️ Cannot update profile: userId is null");
            return;
        }

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
        profile.setLastOrderDate(orderDate);

        if (userName != null && (profile.getName() == null || profile.getName().equals("Unknown User"))) {
            profile.setName(userName);
        }
        if (userEmail != null && (profile.getEmail() == null || profile.getEmail().equals("unknown@example.com"))) {
            profile.setEmail(userEmail);
        }

        userProfileRepository.save(profile);
        log.info("📊 Updated profile for user {}: total orders={}, total spent={}",
                userId, profile.getTotalOrders(), profile.getTotalSpent());
    }

    private UserOrderHistoryResponse convertToResponse(UserOrderHistory order, List<OrderHistoryItem> items) {
        List<OrderItemDto> itemDtos = items != null ? items.stream()
                .map(item -> OrderItemDto.builder()
                        .productId(item.getProductId())
                        .productName(item.getProductName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .totalPrice(item.getTotalPrice())
                        .build())
                .collect(Collectors.toList()) : new ArrayList<>();

        return UserOrderHistoryResponse.builder()
                .id(order.getId())
                .userId(order.getUserId())
                .userName(order.getUserName())
                .userEmail(order.getUserEmail())
                .orderNumber(order.getOrderNumber())
                .shippingAddress(order.getShippingAddress())
                .orderStatus(order.getOrderStatus())
                .totalAmount(order.getTotalAmount())
                .orderDate(order.getOrderDate())
                .recordedAt(order.getRecordedAt())
                .items(itemDtos)
                .build();
    }
}