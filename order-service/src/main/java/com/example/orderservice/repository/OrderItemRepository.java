package com.example.orderservice.repository;

import com.example.orderservice.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    // هنا ما خصنا حتى شي function إضافية، JpaRepository فيها findAll() ديجا
}
