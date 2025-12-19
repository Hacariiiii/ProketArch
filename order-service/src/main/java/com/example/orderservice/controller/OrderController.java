package com.example.orderservice.controller;

import com.example.orderservice.dto.CreateOrderRequest;
import com.example.orderservice.dto.OrderDto;
import com.example.orderservice.dto.CartItemDTO;
import com.example.orderservice.entity.OrderStatus;
import com.example.orderservice.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private static final Logger logger = LoggerFactory.getLogger(OrderController.class);
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // ✅ Create order
    @PostMapping("/create")
    public ResponseEntity<?> createOrder(
            @RequestBody CreateOrderRequest request,
            HttpServletRequest httpRequest) {
        try {
            // ✅ Get userId from request attribute (set by JwtAuthFilter)
            Object userIdObj = httpRequest.getAttribute("userId");

            if (userIdObj == null) {
                logger.warn("⚠️ userId not found in request attributes");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "User not authenticated - no userId"));
            }

            Long userId = (Long) userIdObj;
            logger.info("🛒 Creating order for user: {} with {} items", userId, request.getItems().size());

            OrderDto orderDto = orderService.createOrder(userId, request);
            logger.info("✅ Order created successfully: {}", orderDto.getOrderNumber());

            return ResponseEntity.status(HttpStatus.CREATED).body(orderDto);

        } catch (IllegalArgumentException ex) {
            logger.error("❌ Invalid request: {}", ex.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            logger.error("❌ Error creating order: {}", ex.getMessage(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create order: " + ex.getMessage()));
        }
    }

    // ✅ Get user's orders
    @GetMapping("/my-orders")
    public ResponseEntity<?> getUserOrders(HttpServletRequest request) {
        try {
            Long userId = (Long) request.getAttribute("userId");

            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "User not authenticated"));
            }

            logger.info("📋 Fetching orders for user: {}", userId);
            List<OrderDto> orders = orderService.getUserOrders(userId);

            return ResponseEntity.ok(Map.of(
                    "orders", orders,
                    "count", orders.size()
            ));

        } catch (Exception ex) {
            logger.error("❌ Error fetching orders: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch orders"));
        }
    }

    // ✅ Get specific order
    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrder(
            @PathVariable Long orderId,
            HttpServletRequest request) {
        try {
            Long userId = (Long) request.getAttribute("userId");

            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "User not authenticated"));
            }

            logger.info("📦 Fetching order {} for user {}", orderId, userId);
            OrderDto orderDto = orderService.getOrderById(orderId);

            if (!orderDto.getUserId().equals(userId)) {
                logger.warn("⚠️ User {} tried to access order {} (belongs to {})",
                        userId, orderId, orderDto.getUserId());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You don't have access to this order"));
            }

            return ResponseEntity.ok(orderDto);

        } catch (Exception ex) {
            logger.error("❌ Error fetching order: {}", ex.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ Cancel order
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(
            @PathVariable Long orderId,
            HttpServletRequest request) {
        try {
            Long userId = (Long) request.getAttribute("userId");

            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "User not authenticated"));
            }

            logger.info("❌ Cancelling order {} for user {}", orderId, userId);

            OrderDto orderDto = orderService.getOrderById(orderId);
            if (!orderDto.getUserId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You can't cancel this order"));
            }

            OrderDto cancelledOrder = orderService.cancelOrder(orderId);
            logger.info("✅ Order {} cancelled successfully", orderId);

            return ResponseEntity.ok(cancelledOrder);

        } catch (IllegalArgumentException ex) {
            logger.error("❌ Cannot cancel order: {}", ex.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            logger.error("❌ Error cancelling order: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to cancel order"));
        }
    }

    // ✅ Update order status (Admin only)
    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam OrderStatus status) {
        try {
            logger.info("🔄 Updating order {} status to {}", orderId, status);
            OrderDto orderDto = orderService.updateOrderStatus(orderId, status);
            return ResponseEntity.ok(orderDto);
        } catch (Exception ex) {
            logger.error("❌ Error updating status: {}", ex.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/cart-items")
    public ResponseEntity<List<CartItemDTO>> getAllCartItems() {
        List<CartItemDTO> items = orderService.getAllCartItems();
        return ResponseEntity.ok(items);
    }

    @GetMapping("/validate-review")
    public ResponseEntity<?> validateReview(
            @RequestParam Long userId,
            @RequestParam Long productId
    ) {
        boolean allowed = orderService.canUserReview(userId, productId);
        return ResponseEntity.ok(Map.of("allowed", allowed));
    }












}