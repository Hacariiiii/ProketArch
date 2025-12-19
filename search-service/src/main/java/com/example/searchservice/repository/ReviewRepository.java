package com.example.searchservice.repository;

import com.example.searchservice.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductId(Long productId);

    // Cette méthode existe déjà grâce à JpaRepository
    // findAll() est automatiquement disponible

    boolean existsByUserIdAndProductId(Long userId, Long productId);
}