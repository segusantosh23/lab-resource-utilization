package com.example.lab_resource_utilization.service;

import com.example.lab_resource_utilization.dto.BookingResponse;
import com.example.lab_resource_utilization.entity.*;
import com.example.lab_resource_utilization.exception.InvalidBookingException;
import com.example.lab_resource_utilization.exception.ResourceNotFoundException;
import com.example.lab_resource_utilization.repository.BookingRepository;
import com.example.lab_resource_utilization.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Manages the status transitions and lifecycle of laboratory equipment bookings.
 *
 * Allowed Status Transitions:
 * - PENDING_APPROVAL → CONFIRMED, REJECTED, CANCELLED
 * - CONFIRMED        → IN_USE, CANCELLED, NO_SHOW
 * - IN_USE           → COMPLETED
 *
 * Side-effects:
 * - CANCELLED or REJECTED → WaitlistService.notifyNext() is called so the next
 *   person in the queue is promoted to NOTIFIED status.
 */
@Service
@Transactional
public class BookingLifecycleService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private WaitlistService waitlistService;

    public BookingResponse updateBookingStatus(Long bookingId, BookingStatus newStatus, String userEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        BookingStatus currentStatus = booking.getStatus();

        // 1. Validate State Transition
        validateTransition(currentStatus, newStatus);

        // 2. Validate Authorization
        validateAuthorization(booking, currentUser, newStatus);

        // 3. Update Status
        booking.setStatus(newStatus);
        Booking savedBooking = bookingRepository.save(booking);

        // 4. If booking freed up (CANCELLED or REJECTED), notify next waitlisted user
        if (newStatus == BookingStatus.CANCELLED || newStatus == BookingStatus.REJECTED) {
            Long equipmentId = booking.getEquipment().getId();
            waitlistService.notifyNext(equipmentId);
        }

        return bookingService.mapToResponse(savedBooking);
    }

    private void validateTransition(BookingStatus current, BookingStatus target) {
        boolean isValid = false;

        switch (current) {
            case PENDING_APPROVAL:
                isValid = (target == BookingStatus.CONFIRMED ||
                           target == BookingStatus.REJECTED  ||
                           target == BookingStatus.CANCELLED);
                break;
            case CONFIRMED:
                isValid = (target == BookingStatus.IN_USE   ||
                           target == BookingStatus.CANCELLED ||
                           target == BookingStatus.NO_SHOW);
                break;
            case IN_USE:
                isValid = (target == BookingStatus.COMPLETED);
                break;
            default:
                // COMPLETED, CANCELLED, NO_SHOW, REJECTED are terminal
                isValid = false;
                break;
        }

        if (!isValid) {
            throw new InvalidBookingException(
                "Invalid status transition from " + current + " to " + target);
        }
    }

    private void validateAuthorization(Booking booking, User currentUser, BookingStatus target) {
        boolean isOwner = booking.getUser().getId().equals(currentUser.getId());
        Role role = currentUser.getRole();

        boolean isAdminOrManager = (role == Role.LAB_MANAGER     ||
                                    role == Role.INSTITUTION_ADMIN ||
                                    role == Role.SYSTEM_ADMIN);
        boolean isTech = (role == Role.LAB_TECHNICIAN);

        switch (target) {
            case CONFIRMED:
            case REJECTED:
            case NO_SHOW:
                if (!isAdminOrManager) {
                    throw new InvalidBookingException(
                        "Only managers/admins can approve, reject, or mark bookings as NO_SHOW.");
                }
                break;

            case CANCELLED:
                if (!isOwner && !isAdminOrManager) {
                    throw new InvalidBookingException(
                        "You are not authorized to cancel this booking.");
                }
                break;

            case IN_USE:
            case COMPLETED:
                if (!isOwner && !isTech && !isAdminOrManager) {
                    throw new InvalidBookingException(
                        "You are not authorized to check in or complete this booking.");
                }
                break;

            default:
                throw new InvalidBookingException(
                    "Unsupported status update target: " + target);
        }
    }
}
