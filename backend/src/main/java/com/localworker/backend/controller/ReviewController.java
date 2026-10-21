package com.localworker.backend.controller;

import com.localworker.backend.dto.ReviewRequestDTO;
import com.localworker.backend.dto.ReviewResponseDTO;
import com.localworker.backend.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    // Create a review for a completed booking
    @PostMapping
    public ResponseEntity<ReviewResponseDTO> createReview(
            @Valid @RequestBody ReviewRequestDTO request) {

        ReviewResponseDTO response = reviewService.createReview(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Get all reviews for a worker
    @GetMapping("/worker/{workerId}")
    public ResponseEntity<List<ReviewResponseDTO>> getReviewsByWorker(
            @PathVariable Long workerId) {

        return ResponseEntity.ok(
                reviewService.getReviewsByWorker(workerId));
    }

    // Get a worker's average rating
    @GetMapping("/worker/{workerId}/rating")
    public ResponseEntity<Map<String, Object>> getAverageRating(
            @PathVariable Long workerId) {

        Map<String, Object> response = new HashMap<>();

        response.put("workerId", workerId);
        response.put("averageRating",
                reviewService.getAverageRating(workerId));

        return ResponseEntity.ok(response);
    }

    // Get the total number of reviews for a worker
    @GetMapping("/worker/{workerId}/count")
    public ResponseEntity<Map<String, Object>> getReviewCount(
            @PathVariable Long workerId) {

        Map<String, Object> response = new HashMap<>();

        response.put("workerId", workerId);
        response.put("reviewCount",
                reviewService.getReviewCount(workerId));

        return ResponseEntity.ok(response);
    }
}