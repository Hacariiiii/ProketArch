package com.example.catalogueservice.repository;
import com.example.catalogueservice.entity.UserProfile;
import com.example.catalogueservice.entity.OrderHistoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderHistoryItemRepository extends JpaRepository<OrderHistoryItem, Long> {

}