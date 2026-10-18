package com.hostel.pghfinder.controller;

import com.hostel.pghfinder.dto.ApiResponse;
import com.hostel.pghfinder.entity.Review;
import com.hostel.pghfinder.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewService reviewService;

    @Autowired
    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Review>> addReview(@RequestBody Map<String, Object> payload) {
        try {
            Long userId = (payload.containsKey("userId") && payload.get("userId") != null) 
                    ? Long.valueOf(payload.get("userId").toString()) : null;
            String userEmail = (payload.containsKey("userEmail") && payload.get("userEmail") != null) 
                    ? payload.get("userEmail").toString() : null;
            String userName = (payload.containsKey("userName") && payload.get("userName") != null) 
                    ? payload.get("userName").toString() : null;
            Long propertyId = Long.valueOf(payload.get("propertyId").toString());
            Integer rating = Integer.valueOf(payload.get("rating").toString());
            String comment = payload.containsKey("comment") ? payload.get("comment").toString() : "";

            Review review = reviewService.addOrUpdateReview(userId, userEmail, userName, propertyId, rating, comment);
            return ResponseEntity.ok(ApiResponse.success("Review recorded successfully", review));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/property/{propertyId}")
    public ResponseEntity<ApiResponse<List<Review>>> getReviewsByProperty(@PathVariable Long propertyId) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getReviewsByProperty(propertyId)));
    }
}
