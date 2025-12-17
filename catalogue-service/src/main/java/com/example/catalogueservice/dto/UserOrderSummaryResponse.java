package com.example.catalogueservice.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class UserOrderSummaryResponse {
    private UserProfileResponse profile;
    private List<UserOrderHistoryResponse> orderHistory;
    private Integer totalOrders;
    private BigDecimal totalSpent;
    private LocalDateTime lastOrderDate;
}