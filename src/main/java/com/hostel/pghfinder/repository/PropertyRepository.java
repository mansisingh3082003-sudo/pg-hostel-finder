package com.hostel.pghfinder.repository;

import com.hostel.pghfinder.entity.GenderType;
import com.hostel.pghfinder.entity.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {

    List<Property> findByOwnerId(Long ownerId);

    List<Property> findByStatusAndVerifiedTrue(String status);

    @Query("SELECT p FROM Property p WHERE p.verified = true AND p.status = 'Active' " +
           "AND (:city IS NULL OR LOWER(p.city) LIKE LOWER(CONCAT('%', :city, '%'))) " +
           "AND (:genderType IS NULL OR p.genderType = :genderType) " +
           "AND (:minRent IS NULL OR p.rent >= :minRent) " +
           "AND (:maxRent IS NULL OR p.rent <= :maxRent) " +
           "AND (:keyword IS NULL OR LOWER(p.propertyName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(p.address) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Property> searchProperties(
            @Param("city") String city,
            @Param("genderType") GenderType genderType,
            @Param("minRent") Double minRent,
            @Param("maxRent") Double maxRent,
            @Param("keyword") String keyword
    );

    long countByVerifiedTrue();
    long countByVerifiedFalse();

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query(value = "DELETE FROM bookings WHERE property_id = :id", nativeQuery = true)
    void deleteBookingsByPropertyId(@Param("id") Long id);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query(value = "DELETE FROM reviews WHERE property_id = :id", nativeQuery = true)
    void deleteReviewsByPropertyId(@Param("id") Long id);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query(value = "DELETE FROM rooms WHERE property_id = :id", nativeQuery = true)
    void deleteRoomsByPropertyId(@Param("id") Long id);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query(value = "DELETE FROM property_amenities WHERE property_id = :id", nativeQuery = true)
    void deleteAmenitiesByPropertyId(@Param("id") Long id);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query(value = "DELETE FROM properties WHERE property_id = :id", nativeQuery = true)
    void deletePropertyByIdNative(@Param("id") Long id);
}
