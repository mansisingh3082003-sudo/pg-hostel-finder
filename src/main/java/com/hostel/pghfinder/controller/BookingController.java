package com.hostel.pghfinder.controller;

import com.hostel.pghfinder.dto.ApiResponse;
import com.hostel.pghfinder.dto.BookingRequestDto;
import com.hostel.pghfinder.entity.Booking;
import com.hostel.pghfinder.entity.BookingStatus;
import com.hostel.pghfinder.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;

    @Autowired
    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Booking>> createBooking(@Valid @RequestBody BookingRequestDto request) {
        try {
            Booking booking = bookingService.createBooking(request);
            return ResponseEntity.ok(ApiResponse.success("Booking request submitted successfully! Owner will review.", booking));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<Booking>>> getUserBookings(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getUserBookings(userId)));
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<ApiResponse<List<Booking>>> getOwnerBookings(
            @PathVariable Long ownerId,
            @RequestParam(required = false) String ownerEmail) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getOwnerBookings(ownerId, ownerEmail)));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<Booking>>> getAllBookings() {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getAllBookings()));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Booking>> updateStatus(
            @PathVariable Long id,
            @RequestParam BookingStatus status,
            @RequestParam(required = false) String remarks) {
        try {
            Booking updated = bookingService.updateBookingStatus(id, status, remarks);
            return ResponseEntity.ok(ApiResponse.success("Booking status updated to " + status, updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<ApiResponse<Booking>> recordPayment(
            @PathVariable Long id,
            @RequestParam(required = false) Double amount,
            @RequestParam(required = false) String method,
            @RequestParam(required = false) String transactionId) {
        try {
            Booking updated = bookingService.recordPayment(id, amount, method, transactionId);
            return ResponseEntity.ok(ApiResponse.success("Payment recorded successfully!", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
