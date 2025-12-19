package com.example.searchservice.service;

import com.example.searchservice.dto.ReviewRequest;
import com.example.searchservice.dto.ReviewResponse;
import com.example.searchservice.entity.Review;
import com.example.searchservice.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderClient orderClient;

    public ReviewResponse addReview(ReviewRequest request) {

        // 1️⃣ Vérifier si l'utilisateur peut review
        if (!orderClient.canUserReview(
                request.getUserId(),
                request.getProductId())) {
            throw new RuntimeException("Review not allowed");
        }

        // 2️⃣ Vérifier si review déjà exist
        if (reviewRepository.existsByUserIdAndProductId(
                request.getUserId(),
                request.getProductId())) {
            throw new RuntimeException("Already reviewed");
        }

        // 3️⃣ Créer et sauvegarder la review
        Review review = Review.builder()
                .userId(request.getUserId())
                .productId(request.getProductId())
                .rating(request.getRating())
                .comment(request.getComment())
                .createdAt(LocalDateTime.now())
                .build();

        Review saved = reviewRepository.save(review);

        // 4️⃣ Retourner la réponse
        return ReviewResponse.builder()
                .id(saved.getId())
                .userId(saved.getUserId())
                .userName(null)       // prêt pour User-Service plus tard
                .productId(saved.getProductId())
                .productName(null)    // prêt pour Catalogue-Service plus tard
                .rating(saved.getRating())
                .comment(saved.getComment())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    public List<ReviewResponse> getReviewsByProduct(Long productId) {
        return reviewRepository.findByProductId(productId)
                .stream()
                .map(r -> ReviewResponse.builder()
                        .id(r.getId())
                        .userId(r.getUserId())
                        .userName(null)
                        .productId(r.getProductId())
                        .productName(null)
                        .rating(r.getRating())
                        .comment(r.getComment())
                        .createdAt(r.getCreatedAt())
                        .build())
                .toList();
    }

    // ✅ Récupérer toutes les reviews
    public List<ReviewResponse> getAllReviews() {
        return reviewRepository.findAll()
                .stream()
                .map(r -> ReviewResponse.builder()
                        .id(r.getId())
                        .userId(r.getUserId())
                        .userName(null)
                        .productId(r.getProductId())
                        .productName(null)
                        .rating(r.getRating())
                        .comment(r.getComment())
                        .createdAt(r.getCreatedAt())
                        .build())
                .toList();
    }
}
