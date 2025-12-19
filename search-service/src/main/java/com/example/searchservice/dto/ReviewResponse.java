package com.example.searchservice.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private Long id;
    private Long userId;
    private String userName;        // NOUVEAU
    private Long productId;
    private String productName;     // NOUVEAU
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}