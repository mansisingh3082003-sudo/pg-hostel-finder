package com.hostel.pghfinder.service;

import com.hostel.pghfinder.dto.BookingRequestDto;
import com.hostel.pghfinder.entity.*;
import com.hostel.pghfinder.repository.BookingRepository;
import com.hostel.pghfinder.repository.PropertyRepository;
import com.hostel.pghfinder.repository.RoomRepository;
import com.hostel.pghfinder.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final RoomRepository roomRepository;

    @Autowired
    public BookingService(BookingRepository bookingRepository,
                          UserRepository userRepository,
                          PropertyRepository propertyRepository,
                          RoomRepository roomRepository) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.propertyRepository = propertyRepository;
        this.roomRepository = roomRepository;
    }

    @Transactional
    public Booking createBooking(BookingRequestDto dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + dto.getUserId()));

        Property property = propertyRepository.findById(dto.getPropertyId())
                .orElseThrow(() -> new RuntimeException("Property not found with id: " + dto.getPropertyId()));

        Room room = roomRepository.findById(dto.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found with id: " + dto.getRoomId()));

        if (room.getAvailableRooms() <= 0) {
            throw new RuntimeException("Sorry, no available rooms/beds for the selected room type.");
        }

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setProperty(property);
        booking.setRoom(room);
        booking.setBookingDate(LocalDate.now());
        booking.setCheckInDate(dto.getCheckInDate());
        int months = (dto.getDurationMonths() != null && dto.getDurationMonths() > 0) ? dto.getDurationMonths() : 1;
        booking.setDurationMonths(months);
        booking.setCheckOutDate(dto.getCheckInDate().plusMonths(months));
        booking.setStatus(BookingStatus.PENDING);
        booking.setRemarks(dto.getRemarks());

        return bookingRepository.save(booking);
    }

    public List<Booking> getUserBookings(Long userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Booking> getOwnerBookings(Long ownerId) {
        return getOwnerBookings(ownerId, null);
    }

    public List<Booking> getOwnerBookings(Long ownerId, String ownerEmail) {
        java.util.Set<Booking> set = new java.util.LinkedHashSet<>();
        if (ownerId != null) {
            set.addAll(bookingRepository.findByPropertyOwnerIdOrderByCreatedAtDesc(ownerId));
        }
        if (ownerEmail != null && !ownerEmail.trim().isEmpty()) {
            userRepository.findByEmail(ownerEmail.trim().toLowerCase())
                    .ifPresent(u -> set.addAll(bookingRepository.findByPropertyOwnerIdOrderByCreatedAtDesc(u.getId())));
        }
        return new java.util.ArrayList<>(set);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    @Transactional
    public Booking updateBookingStatus(Long bookingId, BookingStatus newStatus, String remarks) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

        BookingStatus previousStatus = booking.getStatus();

        // If newly APPROVED, decrement available room count
        if (newStatus == BookingStatus.APPROVED && previousStatus != BookingStatus.APPROVED) {
            Room room = booking.getRoom();
            if (room.getAvailableRooms() > 0) {
                room.setAvailableRooms(room.getAvailableRooms() - 1);
                roomRepository.save(room);
            } else {
                throw new RuntimeException("Cannot approve: Room has 0 available beds/units remaining.");
            }
        }
        // If transitioning from APPROVED to REJECTED/CANCELLED, increment available back
        else if (previousStatus == BookingStatus.APPROVED && (newStatus == BookingStatus.CANCELLED || newStatus == BookingStatus.REJECTED)) {
            Room room = booking.getRoom();
            room.setAvailableRooms(room.getAvailableRooms() + 1);
            roomRepository.save(room);
        }

        booking.setStatus(newStatus);
        if (remarks != null && !remarks.trim().isEmpty()) {
            booking.setRemarks(remarks);
        }

        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking recordPayment(Long bookingId, Double amount, String method, String transactionId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));
        booking.setPaymentStatus("PAID");
        if (amount != null && amount > 0) {
            booking.setAmountPaid(amount);
        } else if (booking.getRoom() != null && booking.getRoom().getRent() != null) {
            booking.setAmountPaid(booking.getRoom().getRent());
        } else if (booking.getProperty() != null && booking.getProperty().getRent() != null) {
            booking.setAmountPaid(booking.getProperty().getRent());
        } else {
            booking.setAmountPaid(5000.0);
        }
        booking.setPaymentMethod(method != null && !method.trim().isEmpty() ? method.trim() : "UPI");
        booking.setTransactionId(transactionId != null && !transactionId.trim().isEmpty() ? transactionId.trim() : "TXN_" + System.currentTimeMillis());
        booking.setPaidAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }
}
