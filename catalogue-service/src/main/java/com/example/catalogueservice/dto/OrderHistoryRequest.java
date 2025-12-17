package com.example.catalogueservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
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

    @JsonProperty("items")
    @Builder.Default
    private List<OrderItemDto> items = new ArrayList<>();

    // Getter qui garantit items n'est jamais null
    public List<OrderItemDto> getItems() {
        if (this.items == null) {
            this.items = new ArrayList<>();
        }
        return this.items;
    }
}