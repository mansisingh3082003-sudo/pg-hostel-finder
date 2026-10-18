package com.hostel.pghfinder.service;

import com.hostel.pghfinder.entity.Property;
import com.hostel.pghfinder.entity.Review;
import com.hostel.pghfinder.entity.Role;
import com.hostel.pghfinder.entity.User;
import com.hostel.pghfinder.repository.PropertyRepository;
import com.hostel.pghfinder.repository.ReviewRepository;
import com.hostel.pghfinder.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;

    @Autowired
    public ReviewService(ReviewRepository reviewRepository, UserRepository userRepository, PropertyRepository propertyRepository) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.propertyRepository = propertyRepository;
    }

    public Review addOrUpdateReview(Long userId, String userEmail, String userName, Long propertyId, Integer rating, String comment) {
        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }
        if (user == null && userEmail != null && !userEmail.trim().isEmpty()) {
            user = userRepository.findByEmail(userEmail.trim().toLowerCase()).orElse(null);
        }
        if (user == null) {
            String displayName = (userName != null && !userName.trim().isEmpty()) ? userName.trim() : "Resident";
            String email = (userEmail != null && !userEmail.trim().isEmpty()) ? userEmail.trim().toLowerCase() : "user" + System.currentTimeMillis() + "@pghfinder.com";
            user = new User(null, displayName, email, "9876543210", "user123", Role.USER);
            user = userRepository.save(user);
        }

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found with id: " + propertyId));

        List<Review> existingReviews = reviewRepository.findByPropertyIdOrderByReviewDateDesc(propertyId);
        final Long currentUserId = user.getId();
        final String currentUserEmail = user.getEmail();

        Review reviewToSave = existingReviews.stream()
                .filter(r -> r.getUser() != null && (
                        (r.getUser().getId() != null && r.getUser().getId().equals(currentUserId)) ||
                        (r.getUser().getEmail() != null && r.getUser().getEmail().equalsIgnoreCase(currentUserEmail))
                ))
                .findFirst()
                .orElse(null);

        if (reviewToSave != null) {
            reviewToSave.setRating(rating);
            reviewToSave.setComment(comment);
            reviewToSave.setReviewDate(LocalDateTime.now());
        } else {
            reviewToSave = new Review();
            reviewToSave.setUser(user);
            reviewToSave.setProperty(property);
            reviewToSave.setRating(rating);
            reviewToSave.setComment(comment);
            reviewToSave.setReviewDate(LocalDateTime.now());
        }

        return reviewRepository.save(reviewToSave);
    }

    public Review addReview(Long userId, Long propertyId, Integer rating, String comment) {
        return addOrUpdateReview(userId, null, null, propertyId, rating, comment);
    }

    public List<Review> getReviewsByProperty(Long propertyId) {
        return reviewRepository.findByPropertyIdOrderByReviewDateDesc(propertyId);
    }
}
