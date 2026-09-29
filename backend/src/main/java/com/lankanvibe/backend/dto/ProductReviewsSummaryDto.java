package com.lankanvibe.backend.dto;

import java.util.List;

public class ProductReviewsSummaryDto {

    private Long productId;
    private Double averageRating;
    private Long totalReviews;
    private List<ReviewDto> reviews;

    public ProductReviewsSummaryDto() {}

    public ProductReviewsSummaryDto(Long productId, Double averageRating, Long totalReviews, List<ReviewDto> reviews) {
        this.productId = productId;
        this.averageRating = averageRating;
        this.totalReviews = totalReviews;
        this.reviews = reviews;
    }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }

    public Long getTotalReviews() { return totalReviews; }
    public void setTotalReviews(Long totalReviews) { this.totalReviews = totalReviews; }

    public List<ReviewDto> getReviews() { return reviews; }
    public void setReviews(List<ReviewDto> reviews) { this.reviews = reviews; }
}
