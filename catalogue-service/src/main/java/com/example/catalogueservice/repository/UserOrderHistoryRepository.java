package com.example.catalogueservice.repository;

import com.example.catalogueservice.entity.UserOrderHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserOrderHistoryRepository extends JpaRepository<UserOrderHistory, Long> {

    List<UserOrderHistory> findByUserIdOrderByOrderDateDesc(Long userId);

    Optional<UserOrderHistory> findByOrderNumber(String orderNumber);

    List<UserOrderHistory> findByOrderStatus(String status);

    @Query("SELECT COUNT(u) FROM UserOrderHistory u WHERE u.userId = :userId")
    Integer countOrdersByUserId(Long userId);

    @Query("SELECT SUM(u.totalAmount) FROM UserOrderHistory u WHERE u.userId = :userId")
    java.math.BigDecimal sumTotalAmountByUserId(Long userId);

    List<UserOrderHistory> findByUserIdAndOrderDateBetween(
            Long userId, LocalDateTime startDate, LocalDateTime endDate);


    List<UserOrderHistory> findByUserIdAndOrderStatus(Long userId, String orderStatus);



}