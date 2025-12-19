package com.example.searchservice.service;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class OrderClient {

    private final RestTemplate restTemplate;

    public OrderClient (RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public boolean canUserReview(Long userId, Long productId) {
        String url = "http://localhost:8090/api/catalogue/validate-review"
                + "?userId=" + userId
                + "&productId=" + productId;

        Map<?, ?> response = restTemplate.getForObject(url, Map.class);
        return response != null && Boolean.TRUE.equals(response.get("allowed"));
    }
}


