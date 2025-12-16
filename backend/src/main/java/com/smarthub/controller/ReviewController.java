package com.smarthub.controller;

import com.smarthub.dto.ReviewRequest;
import com.smarthub.entity.Review;
import com.smarthub.repository.ReviewRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/review")
public class ReviewController {
    
    @Autowired
    private ReviewRepository reviewRepository;
    
    @PostMapping
    public ResponseEntity<Review> addReview(@Valid @RequestBody ReviewRequest request) {
        Review review = new Review();
        review.setBookingId(request.getBookingId());
        review.setUserId(request.getUserId());
        review.setProviderId(request.getProviderId());
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        return ResponseEntity.ok(reviewRepository.save(review));
    }
    
    // ✅ Added: Get reviews by provider
    @GetMapping("/provider/{providerId}")
    public ResponseEntity<List<Review>> getProviderReviews(@PathVariable Integer providerId) {
        return ResponseEntity.ok(reviewRepository.findByProviderId(providerId));
    }
    
    // ✅ Added: Get reviews by user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Review>> getUserReviews(@PathVariable Integer userId) {
        return ResponseEntity.ok(reviewRepository.findByUserId(userId));
    }
}
