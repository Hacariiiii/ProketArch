package com.example.catalogueservice.entity;

import jakarta.persistence.*; // ⚠️ Change de javax.persistence à jakarta.persistence
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "user_order_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserOrderHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "user_name")
    private String userName;

    @Column(name = "user_email")
    private String userEmail;

    @Column(name = "order_number", nullable = false, unique = true)
    private String orderNumber;

    @Column(name = "shipping_address")
    private String shippingAddress;

    @Column(name = "order_status", nullable = false)
    private String orderStatus;

    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "order_date", nullable = false)
    private LocalDateTime orderDate;

    @Column(name = "recorded_at")
    @Builder.Default
    private LocalDateTime recordedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "orderHistory", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<OrderHistoryItem> items = new ArrayList<>();

    public void addItem(OrderHistoryItem item) {
        if (items == null) {
            items = new ArrayList<>();
        }
        item.setOrderHistory(this);
        items.add(item);
    }
}