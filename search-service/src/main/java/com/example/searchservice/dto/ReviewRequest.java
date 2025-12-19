package com.example.searchservice.dto;

import lombok.Data;

@Data
public class ReviewRequest {
    private Long userId;
    private Long productId;
    private int rating;
    private String comment;
}
