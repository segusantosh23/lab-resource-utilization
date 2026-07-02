package com.example.lab_resource_utilization.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.lab_resource_utilization.entity.Booking;
import com.example.lab_resource_utilization.service.BookingService;

@RestController
@RequestMapping("/api/booking")
public class BookingController {

    private final BookingService service;

    public BookingController(BookingService service) {
        this.service = service;
    }

    // GET ALL
    @GetMapping
    public List<Booking> getAllBookings() {
        return service.getAllBookings();
    }

    // GET BY ID
    @GetMapping("/{id}")
    public Optional<Booking> getBooking(@PathVariable String id) {
        return service.getBookingById(id);
    }

    // POST
    @PostMapping
    public Booking addBooking(@RequestBody Booking booking) {
        return service.saveBooking(booking);
    }

    // PUT
    @PutMapping("/{id}")
    public Booking updateBooking(@PathVariable String id,
                                 @RequestBody Booking booking) {
        return service.updateBooking(id, booking);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String deleteBooking(@PathVariable String id) {
        service.deleteBooking(id);
        return "Booking deleted successfully";
    }
}