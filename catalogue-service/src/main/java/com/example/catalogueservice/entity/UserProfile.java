package com.example.catalogueservice.entity;

import jakarta.persistence.*; // ⚠️ Change à jakarta.persistence
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_profiles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private Long userId;

    private String name;
    private String email;
    private String phone;
    private String address;

    @Builder.Default
    private Integer totalOrders = 0;

    @Builder.Default
    private BigDecimal totalSpent = BigDecimal.ZERO;

    private LocalDateTime lastOrderDate;
}