package com.hostel.pghfinder.service;

import com.hostel.pghfinder.entity.BookingStatus;
import com.hostel.pghfinder.entity.Role;
import com.hostel.pghfinder.repository.BookingRepository;
import com.hostel.pghfinder.repository.PropertyRepository;
import com.hostel.pghfinder.repository.ReviewRepository;
import com.hostel.pghfinder.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;

    @Autowired
    public AdminService(UserRepository userRepository,
                        PropertyRepository propertyRepository,
                        BookingRepository bookingRepository,
                        ReviewRepository reviewRepository) {
        this.userRepository = userRepository;
        this.propertyRepository = propertyRepository;
        this.bookingRepository = bookingRepository;
        this.reviewRepository = reviewRepository;
    }

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        long totalUsers = userRepository.findByRole(Role.USER).size();
        long totalOwners = userRepository.findByRole(Role.OWNER).size();
        long totalProperties = propertyRepository.count();
        long activeProperties = propertyRepository.countByVerifiedTrue();
        long pendingVerification = propertyRepository.countByVerifiedFalse();

        long totalBookings = bookingRepository.count();
        long pendingBookings = bookingRepository.countByStatus(BookingStatus.PENDING);
        long approvedBookings = bookingRepository.countByStatus(BookingStatus.APPROVED);
        long rejectedBookings = bookingRepository.countByStatus(BookingStatus.REJECTED);

        long totalReviews = reviewRepository.count();

        stats.put("totalStudents", totalUsers);
        stats.put("totalOwners", totalOwners);
        stats.put("totalProperties", totalProperties);
        stats.put("activeProperties", activeProperties);
        stats.put("pendingVerification", pendingVerification);
        stats.put("totalBookings", totalBookings);
        stats.put("pendingBookings", pendingBookings);
        stats.put("approvedBookings", approvedBookings);
        stats.put("rejectedBookings", rejectedBookings);
        stats.put("totalReviews", totalReviews);

        return stats;
    }
}
