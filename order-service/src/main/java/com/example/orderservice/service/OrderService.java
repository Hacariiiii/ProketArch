package com.example.orderservice.service;

import com.example.orderservice.entity.Order;
import com.example.orderservice.entity.OrderItem;
import com.example.orderservice.entity.OrderStatus;
import com.example.orderservice.dto.CreateOrderRequest;
import com.example.orderservice.dto.OrderDto;
import com.example.orderservice.dto.CartItemDTO;
import com.example.orderservice.repository.OrderRepository;
import com.example.orderservice.repository.OrderItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.*;
import java.util.stream.Collectors;


@Service
@Transactional
public class OrderService {

    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    public OrderService(OrderRepository orderRepository, OrderItemRepository orderItemRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
    }

    // ✅ Create new order
    public OrderDto createOrder(Long userId, CreateOrderRequest request) {
        logger.info("📦 Creating order for user: {}", userId);

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one item");
        }

        // Calculate total amount
        Double totalAmount = request.getItems().stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();

        // Create order
        String orderNumber = "ORD-" + System.currentTimeMillis();
        Order order = new Order(userId, orderNumber, totalAmount, request.getShippingAddress());
        order.setCreatedAt(new Date());

        // Add items to order
        for (CreateOrderRequest.CartItem cartItem : request.getItems()) {
            OrderItem orderItem = new OrderItem(
                    cartItem.getProductId(),
                    cartItem.getProductName(),
                    cartItem.getQuantity(),
                    cartItem.getPrice(),
                    cartItem.getImage()
            );

            orderItem.setOrder(order);
            order.getItems().add(orderItem);
        }

        Order savedOrder = orderRepository.save(order);
        logger.info("✅ Order created: {} for user: {}", savedOrder.getOrderNumber(), userId);

        return convertToDto(savedOrder);
    }

    // ✅ Get user orders
    public List<OrderDto> getUserOrders(Long userId) {
        logger.info("📋 Fetching orders for user: {}", userId);
        return orderRepository.findByUserId(userId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // ✅ Get order by ID
    public OrderDto getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
        return convertToDto(order);
    }

    // ✅ Update order status
    public OrderDto updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        order.setStatus(status);
        order.setUpdatedAt(new Date());
        Order updatedOrder = orderRepository.save(order);

        logger.info("✅ Order {} status updated to: {}", orderId, status);
        return convertToDto(updatedOrder);
    }

    // ✅ Cancel order
    public OrderDto cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalArgumentException("Cannot cancel order with status: " + order.getStatus());
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setUpdatedAt(new Date());
        Order updatedOrder = orderRepository.save(order);

        logger.info("❌ Order {} cancelled", orderId);
        return convertToDto(updatedOrder);
    }

    // ✅ Convert to DTO
    private OrderDto convertToDto(Order order) {
        OrderDto dto = new OrderDto(
                order.getId(),
                order.getOrderNumber(),
                order.getUserId(),
                order.getStatus(),
                order.getTotalAmount(),
                order.getShippingAddress(),
                order.getCreatedAt()
        );

        order.getItems().forEach(item ->
                dto.getItems().add(new OrderDto.OrderItemDto(
                        item.getProductId(),
                        item.getProductName(),
                        item.getQuantity(),
                        item.getPrice()


                ))
        );

        return dto;
    }

    public List<CartItemDTO> getAllCartItems() {
        return orderItemRepository.findAll()
                .stream()
                .map(item -> new CartItemDTO(
                        item.getProductId(),
                        item.getProductName(),
                        item.getPrice(),
                        item.getImage()
                ))
                .collect(Collectors.toList());
    }

    public CartItemDTO getCartItemById(Long id) {
        OrderItem item = orderItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found: " + id));

        return new CartItemDTO(item.getProductId(), item.getProductName(), item.getPrice(), item.getImage());
    }



}
