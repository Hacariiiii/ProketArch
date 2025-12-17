package com.example.catalogueservice.entity;

import jakarta.persistence.*; // ⚠️ Change à jakarta.persistence
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "order_history_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderHistoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_history_id", nullable = false)
    private UserOrderHistory orderHistory;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false)
    private BigDecimal unitPrice;

    @Column(name = "total_price", nullable = false)
    private BigDecimal totalPrice;
}