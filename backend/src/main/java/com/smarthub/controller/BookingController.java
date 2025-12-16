package com.smarthub.controller;

import com.smarthub.dto.BookingRequest;
import com.smarthub.entity.Booking;
import com.smarthub.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    
    @Autowired
    private BookingService bookingService;

    @PostMapping
    public ResponseEntity<Booking> createBooking(@Valid @RequestBody BookingRequest request) {
        return ResponseEntity.ok(bookingService.createBooking(request));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Booking>> getUserBookings(@PathVariable Integer userId) {
        return ResponseEntity.ok(bookingService.getUserBookings(userId));
    }

    @GetMapping("/provider/{providerId}")
    public ResponseEntity<List<Booking>> getProviderBookings(@PathVariable Integer providerId) {
        return ResponseEntity.ok(bookingService.getProviderBookings(providerId));
    }

    // ✅ Support both PUT and PATCH methods
    @PutMapping("/{bookingId}/status")
    @PatchMapping("/{bookingId}/status")
    public ResponseEntity<Booking> updateStatus(
            @PathVariable Integer bookingId,
            @RequestBody Map<String, String> request) {
        
        String status = request.get("status");
        if (status == null || status.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        return ResponseEntity.ok(
            bookingService.updateBookingStatus(bookingId, status)
        );
    }

    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }
}
