package com.hostel.pghfinder.repository;

import com.hostel.pghfinder.entity.Booking;
import com.hostel.pghfinder.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Booking> findByPropertyOwnerIdOrderByCreatedAtDesc(Long ownerId);

    List<Booking> findByPropertyId(Long propertyId);

    long countByStatus(BookingStatus status);
}
