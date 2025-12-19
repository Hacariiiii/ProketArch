package com.example.searchservice.controller;

import com.example.searchservice.dto.ReviewRequest;
import com.example.searchservice.dto.ReviewResponse;
import com.example.searchservice.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@CrossOrigin("*")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<?> addReview(@RequestBody ReviewRequest request) {
        try {
            return ResponseEntity.ok(reviewService.addReview(request));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(
                reviewService.getReviewsByProduct(productId)
        );
    }

    @GetMapping("/all")
    public ResponseEntity<List<ReviewResponse>> getAllReviews() {
        List<ReviewResponse> reviews = reviewService.getAllReviews();
        return ResponseEntity.ok(reviews);
    }
}