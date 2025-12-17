package com.example.catalogueservice.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserOrderHistoryResponse {

    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private String orderNumber;
    private LocalDateTime orderDate;
    private BigDecimal totalAmount;
    private String orderStatus;
    private String shippingAddress;
    private LocalDateTime recordedAt;
    private List<OrderItemDto> items;
}