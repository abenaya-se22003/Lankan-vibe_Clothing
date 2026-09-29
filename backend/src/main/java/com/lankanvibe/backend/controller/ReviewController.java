package com.lankanvibe.backend.controller;

import com.lankanvibe.backend.dto.CreateReviewRequest;
import com.lankanvibe.backend.dto.ProductReviewsSummaryDto;
import com.lankanvibe.backend.dto.ReviewDto;
import com.lankanvibe.backend.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * ReviewController - REST API endpoints for product reviews and ratings
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    // GET /api/products/{productId}/reviews - Public: get reviews for a product
    @GetMapping("/products/{productId}/reviews")
    public ResponseEntity<ProductReviewsSummaryDto> getReviewsForProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getReviewsForProduct(productId));
    }

    // POST /api/products/{productId}/reviews - Authenticated: submit/update product review
    @PostMapping("/products/{productId}/reviews")
    public ResponseEntity<ReviewDto> addOrUpdateReview(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateReviewRequest request) {
        ReviewDto created = reviewService.addOrUpdateReview(userDetails.getUsername(), productId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // DELETE /api/reviews/{id} - Authenticated: delete a review
    @DeleteMapping("/reviews/{id}")
    public ResponseEntity<?> deleteReview(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        reviewService.deleteReview(userDetails.getUsername(), id);
        return ResponseEntity.ok(Map.of("message", "Review deleted successfully"));
    }

    // GET /api/reviews/my - Authenticated: get user's own reviews
    @GetMapping("/reviews/my")
    public ResponseEntity<List<ReviewDto>> getMyReviews(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(reviewService.getMyReviews(userDetails.getUsername()));
    }
}
