package com.example.orderservice.dto;

import com.example.orderservice.entity.OrderStatus;
import java.util.*;

public class OrderDto {
    private Long id;
    private String orderNumber;
    private Long userId;
    private OrderStatus status;
    private Double totalAmount;
    private String shippingAddress;
    private List<OrderItemDto> items;
    private Date createdAt;
    private Date updatedAt;

    public OrderDto(Long id, String orderNumber, Long userId, OrderStatus status,
                    Double totalAmount, String shippingAddress, Date createdAt) {
        this.id = id;
        this.orderNumber = orderNumber;
        this.userId = userId;
        this.status = status;
        this.totalAmount = totalAmount;
        this.shippingAddress = shippingAddress;
        this.createdAt = createdAt;
        this.items = new ArrayList<>();
    }

    public Long getId() { return id; }
    public String getOrderNumber() { return orderNumber; }
    public Long getUserId() { return userId; }
    public OrderStatus getStatus() { return status; }
    public Double getTotalAmount() { return totalAmount; }
    public String getShippingAddress() { return shippingAddress; }
    public List<OrderItemDto> getItems() { return items; }
    public Date getCreatedAt() { return createdAt; }
    public Date getUpdatedAt() { return updatedAt; }

    public static class OrderItemDto {
        private Long productId;
        private String productName;
        private Integer quantity;
        private Double price;

        public OrderItemDto(Long productId, String productName, Integer quantity, Double price) {
            this.productId = productId;
            this.productName = productName;
            this.quantity = quantity;
            this.price = price;
        }

        public Long getProductId() { return productId; }
        public String getProductName() { return productName; }
        public Integer getQuantity() { return quantity; }
        public Double getPrice() { return price; }
    }
}