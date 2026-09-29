package com.lankanvibe.backend.service;

import com.lankanvibe.backend.dto.CreateReviewRequest;
import com.lankanvibe.backend.dto.ProductReviewsSummaryDto;
import com.lankanvibe.backend.dto.ReviewDto;
import com.lankanvibe.backend.model.Product;
import com.lankanvibe.backend.model.Review;
import com.lankanvibe.backend.model.User;
import com.lankanvibe.backend.repository.ProductRepository;
import com.lankanvibe.backend.repository.ReviewRepository;
import com.lankanvibe.backend.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * ReviewService - Business logic for product reviews and ratings
 */
@Service
@Transactional
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ReviewService(ReviewRepository reviewRepository,
                         ProductRepository productRepository,
                         UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    // Public: Get reviews and rating summary for a product
    @Transactional(readOnly = true)
    public ProductReviewsSummaryDto getReviewsForProduct(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new IllegalArgumentException("Product not found with ID: " + productId);
        }

        List<Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
        Double avg = reviewRepository.findAverageRatingByProductId(productId);
        long count = reviewRepository.countByProductId(productId);

        Double roundedAvg = 0.0;
        if (avg != null) {
            roundedAvg = BigDecimal.valueOf(avg)
                    .setScale(1, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        List<ReviewDto> reviewDtos = reviews.stream()
                .map(this::mapToDto)
                .toList();

        return new ProductReviewsSummaryDto(productId, roundedAvg, count, reviewDtos);
    }

    // Customer: Submit or update review for a product
    public ReviewDto addOrUpdateReview(String userEmail, Long productId, CreateReviewRequest request) {
        User user = getUser(userEmail);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + productId));

        Review review = reviewRepository.findByProductIdAndUserId(productId, user.getId())
                .orElse(null);

        if (review != null) {
            // Update existing review
            review.setRating(request.getRating());
            review.setComment(request.getComment());
        } else {
            // Create new review
            review = new Review();
            review.setProduct(product);
            review.setUser(user);
            review.setRating(request.getRating());
            review.setComment(request.getComment());
        }

        Review saved = reviewRepository.save(review);
        return mapToDto(saved);
    }

    // Delete review (owner or admin)
    public void deleteReview(String userEmail, Long reviewId) {
        User user = getUser(userEmail);
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found with ID: " + reviewId));

        if (!review.getUser().getId().equals(user.getId()) && user.getRole() != User.Role.ADMIN) {
            throw new AccessDeniedException("Not authorized to delete this review");
        }

        reviewRepository.delete(review);
    }

    // Customer: Get all reviews written by current user
    @Transactional(readOnly = true)
    public List<ReviewDto> getMyReviews(String userEmail) {
        User user = getUser(userEmail);
        return reviewRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
    }

    private ReviewDto mapToDto(Review review) {
        String fullName = review.getUser().getFirstName() + " " + review.getUser().getLastName();
        return new ReviewDto(
                review.getId(),
                review.getProduct().getId(),
                review.getUser().getId(),
                fullName.trim(),
                review.getUser().getEmail(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt(),
                review.getUpdatedAt()
        );
    }
}
