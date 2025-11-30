package com.example.orderservice.dto;

public class CartItemDTO {

    private Long productId;
    private String productName;
    private Double price;
    private String image;

    public CartItemDTO() {}

    public CartItemDTO(Long productId, String productName, Double price,String image) {
        this.productId = productId;
        this.productName = productName;
        this.price = price;
        this.image=image;
    }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
}
