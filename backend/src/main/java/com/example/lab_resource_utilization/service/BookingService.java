package com.example.lab_resource_utilization.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.lab_resource_utilization.entity.Booking;
import com.example.lab_resource_utilization.repository.BookingRepository;

@Service
public class BookingService {

    private final BookingRepository repository;

    public BookingService(BookingRepository repository) {
        this.repository = repository;
    }

    // GET ALL
    public List<Booking> getAllBookings() {
        return repository.findAll();
    }

    // GET BY ID
    public Optional<Booking> getBookingById(String id) {
        return repository.findById(id);
    }

    // POST
    public Booking saveBooking(Booking booking) {
        return repository.save(booking);
    }

    // PUT
    public Booking updateBooking(String id, Booking booking) {

        Optional<Booking> existing = repository.findById(id);

        if (existing.isPresent()) {

            Booking updated = existing.get();

            updated.setBookingDate(booking.getBookingDate());
            updated.setStartTime(booking.getStartTime());
            updated.setEndTime(booking.getEndTime());
            updated.setStatus(booking.getStatus());
            updated.setUserId(booking.getUserId());
            updated.setEquipmentId(booking.getEquipmentId());

            return repository.save(updated);
        }

        return null;
    }

    // DELETE
    public void deleteBooking(String id) {
        repository.deleteById(id);
    }
}