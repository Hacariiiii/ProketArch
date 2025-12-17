package com.example.orderservice.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderHistoryRequest {
    private Long userId;
    private String userName;
    private String userEmail;
    private String orderNumber;
    private String shippingAddress;
    private String status;
    private BigDecimal totalAmount;
    private LocalDateTime orderDate;
    private List<OrderHistoryItemDto> items;
}