package com.example.lab_resource_utilization.service;

import com.example.lab_resource_utilization.dto.BookingRequest;
import com.example.lab_resource_utilization.dto.BookingResponse;
import com.example.lab_resource_utilization.entity.*;
import com.example.lab_resource_utilization.exception.InvalidBookingException;
import com.example.lab_resource_utilization.exception.ResourceNotFoundException;
import com.example.lab_resource_utilization.repository.BookingRepository;
import com.example.lab_resource_utilization.repository.EquipmentRepository;
import com.example.lab_resource_utilization.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    public BookingResponse mapToResponse(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setUserId(booking.getUser().getId());
        response.setUserName(booking.getUser().getName());
        response.setUserEmail(booking.getUser().getEmail());
        response.setEquipmentId(booking.getEquipment().getId());
        response.setEquipmentName(booking.getEquipment().getName());
        response.setStartTime(booking.getStartTime());
        response.setEndTime(booking.getEndTime());
        response.setStatus(booking.getStatus());
        response.setPurpose(booking.getPurpose());
        response.setCreatedAt(booking.getCreatedAt());
        response.setUpdatedAt(booking.getUpdatedAt());
        return response;
    }

    public BookingResponse createBooking(BookingRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with id: " + request.getEquipmentId()));

        if (equipment.getStatus() != EquipmentStatus.AVAILABLE) {
            throw new InvalidBookingException("Equipment is not available for booking. Current status: " + equipment.getStatus());
        }

        if (request.getStartTime().isBefore(LocalDateTime.now())) {
            throw new InvalidBookingException("Start time must be in the future.");
        }

        if (request.getEndTime().isBefore(request.getStartTime())) {
            throw new InvalidBookingException("End time must be after start time.");
        }

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setEquipment(equipment);
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setStatus(BookingStatus.PENDING_APPROVAL);

        Booking savedBooking = bookingRepository.save(booking);
        return mapToResponse(savedBooking);
    }

    public BookingResponse updateBooking(Long id, BookingRequest request, String userEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        // Only allow updating if status is PENDING_APPROVAL
        if (booking.getStatus() != BookingStatus.PENDING_APPROVAL) {
            throw new InvalidBookingException("Only bookings in PENDING_APPROVAL status can be updated.");
        }

        // Verify authorization: owner or managers/admins
        boolean isOwner = booking.getUser().getId().equals(currentUser.getId());
        boolean isAdminOrManager = currentUser.getRole() == Role.LAB_MANAGER ||
                currentUser.getRole() == Role.INSTITUTION_ADMIN ||
                currentUser.getRole() == Role.SYSTEM_ADMIN;

        if (!isOwner && !isAdminOrManager) {
            throw new InvalidBookingException("You are not authorized to update this booking.");
        }

        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with id: " + request.getEquipmentId()));

        if (equipment.getStatus() != EquipmentStatus.AVAILABLE) {
            throw new InvalidBookingException("Equipment is not available for booking. Current status: " + equipment.getStatus());
        }

        if (request.getStartTime().isBefore(LocalDateTime.now())) {
            throw new InvalidBookingException("Start time must be in the future.");
        }

        if (request.getEndTime().isBefore(request.getStartTime())) {
            throw new InvalidBookingException("End time must be after start time.");
        }

        booking.setEquipment(equipment);
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());

        Booking savedBooking = bookingRepository.save(booking);
        return mapToResponse(savedBooking);
    }

    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        return mapToResponse(booking);
    }

    public List<BookingResponse> getUserBookings(String userEmail) {
        return bookingRepository.findByUserEmail(userEmail)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
}
