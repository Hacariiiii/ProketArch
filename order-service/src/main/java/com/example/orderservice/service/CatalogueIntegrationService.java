package com.example.orderservice.service;

import com.example.orderservice.dto.OrderHistoryItemDto;
import com.example.orderservice.entity.Order;
import com.example.orderservice.entity.OrderItem;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CatalogueIntegrationService {

    private final RestTemplate restTemplate;

    @Value("${catalogue.service.url:http://localhost:8090}") // Port du catalogue service
    private String catalogueServiceUrl;

    public void sendOrderToCatalogue(Order order, String userName, String userEmail) {
        try {
            log.info("📤 Sending order {} to catalogue service for user {}",
                    order.getOrderNumber(), order.getUserId());

            // Convertir Date en LocalDateTime
            LocalDateTime orderDate = order.getCreatedAt()
                    .toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDateTime();

            // Créer la liste des items
            var items = order.getItems().stream()
                    .map(item -> Map.of(
                            "productId", item.getProductId(),
                            "productName", item.getProductName(),
                            "quantity", item.getQuantity(),
                            "unitPrice", BigDecimal.valueOf(item.getPrice()),
                            "totalPrice", BigDecimal.valueOf(item.getPrice() * item.getQuantity())
                    ))
                    .collect(Collectors.toList());

            // Construire la requête au format Map (plus simple)
            Map<String, Object> request = new HashMap<>();
            request.put("userId", order.getUserId());
            request.put("userName", userName);
            request.put("userEmail", userEmail);
            request.put("orderNumber", order.getOrderNumber());
            request.put("shippingAddress", order.getShippingAddress());
            request.put("status", order.getStatus().name());
            request.put("totalAmount", BigDecimal.valueOf(order.getTotalAmount()));
            request.put("orderDate", orderDate);
            request.put("items", items);

            log.info("Request to catalogue: {}", request);

            // URL du catalogue service
            String url = catalogueServiceUrl + "/api/catalogue/orders";

            // Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Créer l'entity
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

            // Envoyer la requête POST
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("✅ Order {} successfully sent to catalogue service", order.getOrderNumber());
            } else {
                log.warn("⚠️ Catalogue service returned status: {} - {}",
                        response.getStatusCode(), response.getBody());
            }

        } catch (Exception e) {
            log.error("❌ Failed to send order {} to catalogue: {}",
                    order.getOrderNumber(), e.getMessage());
            // Ne pas throw pour ne pas bloquer la création de l'order
        }
    }
}