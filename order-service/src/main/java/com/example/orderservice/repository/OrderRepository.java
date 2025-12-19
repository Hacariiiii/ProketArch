package com.example.orderservice.repository;

import com.example.orderservice.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);
    Optional<Order> findByOrderNumber(String orderNumber);
    boolean existsByUserIdAndStatusAndItems_ProductId(
            Long userId,
            OrderStatus status,
            Long productId
    );
    List<Order> findByUserIdAndStatus(Long userId, OrderStatus status);

}