package com.example.orderservice.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOrderRequest {
    private String shippingAddress;

    // ✅ Ajoute ces champs pour le catalogue
    private String userName;
    private String userEmail;

    private List<CartItem> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CartItem {
        private Long productId;
        private String productName;
        private Integer quantity;
        private Double price;
        private String image;
    }
}