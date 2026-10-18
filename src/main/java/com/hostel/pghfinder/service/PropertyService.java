package com.hostel.pghfinder.service;

import com.hostel.pghfinder.entity.Booking;
import com.hostel.pghfinder.entity.GenderType;
import com.hostel.pghfinder.entity.Property;
import com.hostel.pghfinder.entity.Review;
import com.hostel.pghfinder.entity.Role;
import com.hostel.pghfinder.entity.Room;
import com.hostel.pghfinder.entity.RoomType;
import com.hostel.pghfinder.entity.User;
import com.hostel.pghfinder.repository.BookingRepository;
import com.hostel.pghfinder.repository.PropertyRepository;
import com.hostel.pghfinder.repository.ReviewRepository;
import com.hostel.pghfinder.repository.RoomRepository;
import com.hostel.pghfinder.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;

    @Autowired
    public PropertyService(PropertyRepository propertyRepository,
                           UserRepository userRepository,
                           ReviewRepository reviewRepository,
                           BookingRepository bookingRepository,
                           RoomRepository roomRepository) {
        this.propertyRepository = propertyRepository;
        this.userRepository = userRepository;
        this.reviewRepository = reviewRepository;
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
    }

    public List<Property> getAllActiveProperties() {
        return propertyRepository.findByStatusAndVerifiedTrue("Active");
    }

    public List<Property> getAllProperties() {
        return propertyRepository.findAll();
    }

    public List<Property> searchProperties(String city, GenderType genderType, Double minRent, Double maxRent, String keyword) {
        return propertyRepository.searchProperties(
                (city != null && !city.trim().isEmpty()) ? city.trim() : null,
                genderType,
                minRent,
                maxRent,
                (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null
        );
    }

    public Property getPropertyById(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found with id: " + id));
        List<Review> reviews = reviewRepository.findByPropertyIdOrderByReviewDateDesc(id);
        property.setReviews(reviews);
        return property;
    }

    public List<Property> getPropertiesByOwner(Long ownerId, String ownerEmail) {
        Set<Property> set = new LinkedHashSet<>();
        if (ownerId != null) {
            set.addAll(propertyRepository.findByOwnerId(ownerId));
        }
        if (ownerEmail != null && !ownerEmail.trim().isEmpty()) {
            userRepository.findByEmail(ownerEmail.trim().toLowerCase())
                    .ifPresent(u -> set.addAll(propertyRepository.findByOwnerId(u.getId())));
        }
        return new ArrayList<>(set);
    }

    public List<Property> getPropertiesByOwner(Long ownerId) {
        return getPropertiesByOwner(ownerId, null);
    }

    public Property createProperty(Property property, Long ownerId, String ownerEmail) {
        User owner = null;
        if (ownerId != null) {
            owner = userRepository.findById(ownerId).orElse(null);
        }
        if (owner == null && ownerEmail != null && !ownerEmail.trim().isEmpty()) {
            owner = userRepository.findByEmail(ownerEmail.trim().toLowerCase()).orElse(null);
        }
        if (owner == null) {
            owner = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == Role.OWNER)
                    .findFirst()
                    .orElse(null);
        }
        if (owner == null) {
            // Reconcile user in database if registered via frontend session
            owner = new User();
            owner.setName(property.getPropertyName() + " Owner");
            owner.setEmail(ownerEmail != null && !ownerEmail.isEmpty() ? ownerEmail.trim().toLowerCase() : "owner" + (ownerId != null ? ownerId : System.currentTimeMillis()) + "@example.com");
            owner.setPassword("owner123");
            owner.setRole(Role.OWNER);
            owner.setPhone(property.getContactPhone());
            owner = userRepository.save(owner);
        }

        property.setOwner(owner);
        property.setVerified(true); // Default verified for ease of use
        property.setStatus("Active");
        if (property.getState() == null || property.getState().trim().isEmpty()) {
            property.setState("Uttar Pradesh");
        }
        Property saved = propertyRepository.save(property);

        // Auto-create a starter room if property has no rooms
        if (saved.getRooms() == null || saved.getRooms().isEmpty()) {
            Room starterRoom = new Room(null, saved, RoomType.DOUBLE, "101", saved.getRent(), 2, 2, false);
            roomRepository.save(starterRoom);
            if (saved.getRooms() == null) {
                saved.setRooms(new ArrayList<>());
            }
            saved.getRooms().add(starterRoom);
        }

        return saved;
    }

    public Property createProperty(Property property, Long ownerId) {
        return createProperty(property, ownerId, null);
    }

    public Property updateProperty(Long id, Property updatedData) {
        Property existing = getPropertyById(id);
        existing.setPropertyName(updatedData.getPropertyName());
        existing.setAddress(updatedData.getAddress());
        existing.setCity(updatedData.getCity());
        existing.setState(updatedData.getState());
        existing.setPincode(updatedData.getPincode());
        existing.setRent(updatedData.getRent());
        existing.setDeposit(updatedData.getDeposit());
        existing.setGenderType(updatedData.getGenderType());
        existing.setDescription(updatedData.getDescription());
        existing.setRules(updatedData.getRules());
        existing.setContactPhone(updatedData.getContactPhone());
        existing.setContactEmail(updatedData.getContactEmail());
        if (updatedData.getImageUrl() != null && !updatedData.getImageUrl().isEmpty()) {
            existing.setImageUrl(updatedData.getImageUrl());
        }
        if (updatedData.getAmenities() != null) {
            existing.setAmenities(updatedData.getAmenities());
        }
        return propertyRepository.save(existing);
    }

    public Property togglePropertyVerification(Long id) {
        Property property = getPropertyById(id);
        property.setVerified(!property.getVerified());
        return propertyRepository.save(property);
    }

    public Property togglePropertyStatus(Long id) {
        Property property = getPropertyById(id);
        String current = property.getStatus();
        property.setStatus("Active".equalsIgnoreCase(current) ? "Inactive" : "Active");
        return propertyRepository.save(property);
    }

    @Transactional
    public void deleteProperty(Long id) {
        // 1. Delete all bookings referencing this property
        propertyRepository.deleteBookingsByPropertyId(id);

        // 2. Delete all reviews referencing this property
        propertyRepository.deleteReviewsByPropertyId(id);

        // 3. Delete all rooms belonging to this property
        propertyRepository.deleteRoomsByPropertyId(id);

        // 4. Delete all property amenities
        propertyRepository.deleteAmenitiesByPropertyId(id);

        // 5. Delete the property itself
        propertyRepository.deletePropertyByIdNative(id);
    }
}
