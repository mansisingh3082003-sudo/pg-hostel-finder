package com.hostel.pghfinder.repository;

import com.hostel.pghfinder.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByPropertyIdOrderByReviewDateDesc(Long propertyId);
}
