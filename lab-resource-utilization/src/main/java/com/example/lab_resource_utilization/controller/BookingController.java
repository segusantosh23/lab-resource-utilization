package com.example.lab_resource_utilization.controller;

import com.example.lab_resource_utilization.dto.BookingRequest;
import com.example.lab_resource_utilization.dto.BookingResponse;
import com.example.lab_resource_utilization.entity.BookingStatus;
import com.example.lab_resource_utilization.service.BookingLifecycleService;
import com.example.lab_resource_utilization.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private BookingLifecycleService bookingLifecycleService;

    // Create Booking — 201 CREATED
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingResponse> create(@Valid @RequestBody BookingRequest request, Principal principal) {
        BookingResponse response = bookingService.createBooking(request, principal.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Update Booking — 200 OK
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingResponse> update(@PathVariable Long id,
                                                  @Valid @RequestBody BookingRequest request,
                                                  Principal principal) {
        BookingResponse response = bookingService.updateBooking(id, request, principal.getName());
        return ResponseEntity.ok(response);
    }

    // Get All Bookings — 200 OK (Only accessible by managers/admins)
    @GetMapping
    @PreAuthorize("hasAnyRole('LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<List<BookingResponse>> getAll(Principal principal) {
    List<BookingResponse> bookings =
            bookingService.getAllBookings(principal.getName());

    return ResponseEntity.ok(bookings);
}

    // Get Booking By ID — 200 OK
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingResponse> getById(@PathVariable Long id) {
        BookingResponse response = bookingService.getBookingById(id);
        return ResponseEntity.ok(response);
    }

    // Get My Bookings — 200 OK
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<BookingResponse>> getMyBookings(Principal principal) {
        List<BookingResponse> bookings = bookingService.getUserBookings(principal.getName());
        return ResponseEntity.ok(bookings);
    }

    // Update Booking Status — 200 OK
    @PutMapping("/{id}/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingResponse> updateStatus(@PathVariable Long id,
                                                        @RequestParam BookingStatus status,
                                                        Principal principal) {
        BookingResponse response = bookingLifecycleService.updateBookingStatus(id, status, principal.getName());
        return ResponseEntity.ok(response);
    }
}
