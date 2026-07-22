package com.example.lab_resource_utilization.service;

import com.example.lab_resource_utilization.dto.WaitlistRequest;
import com.example.lab_resource_utilization.dto.WaitlistResponse;
import com.example.lab_resource_utilization.entity.Equipment;
import com.example.lab_resource_utilization.entity.User;
import com.example.lab_resource_utilization.entity.Waitlist;
import com.example.lab_resource_utilization.entity.WaitlistStatus;
import com.example.lab_resource_utilization.repository.EquipmentRepository;
import com.example.lab_resource_utilization.repository.UserRepository;
import com.example.lab_resource_utilization.repository.WaitlistRepository;
import com.example.lab_resource_utilization.repository.BookingRepository;
import com.example.lab_resource_utilization.entity.Booking;
import com.example.lab_resource_utilization.entity.BookingStatus;
import com.example.lab_resource_utilization.entity.Role;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WaitlistService {

    @Autowired
    private WaitlistRepository waitlistRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    /** Get current user's waitlist entries */
    public List<WaitlistResponse> getMyWaitlist(String email) {
        return waitlistRepository.findByUserEmailOrderByJoinedAtAsc(email)
                .stream()
                .map(WaitlistResponse::from)
                .collect(Collectors.toList());
    }

    /** Get all waitlist entries — managers/admins only */
    public List<WaitlistResponse> getAllWaitlist() {
        return waitlistRepository.findAllByOrderByEquipmentIdAscPositionAsc()
                .stream()
                .map(WaitlistResponse::from)
                .collect(Collectors.toList());
    }

    /** Join the waitlist for a piece of equipment */
    @Transactional
    public WaitlistResponse joinWaitlist(String email, WaitlistRequest request) {
        // Validate user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Validate equipment
        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Equipment not found"));

        // Check if already on waitlist
        Waitlist existing = waitlistRepository.findByUserEmailAndEquipmentId(email, request.getEquipmentId()).orElse(null);

        if (existing != null) {
            if (existing.getStatus() == WaitlistStatus.WAITING) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "You are already on the waitlist for this equipment");
            }
            // If NOTIFIED, they can join again. We will recycle the entry.
        }

        // Calculate next position
        int nextPosition = waitlistRepository.countWaitingByEquipmentId(request.getEquipmentId()) + 1;

        Waitlist entry = existing != null ? existing : new Waitlist();
        entry.setUser(user);
        entry.setEquipment(equipment);
        entry.setPosition(nextPosition);
        entry.setStatus(WaitlistStatus.WAITING);
        entry.setStartTime(request.getStartTime());
        entry.setEndTime(request.getEndTime());
        entry.setQuantity(request.getQuantity());
        entry.setPurpose(request.getPurpose());
        if (existing != null) {
            entry.setJoinedAt(java.time.LocalDateTime.now());
            entry.setNotifiedAt(null);
        }

        return WaitlistResponse.from(waitlistRepository.save(entry));
    }

    /** Leave / remove a waitlist entry */
    @Transactional
    public void leaveWaitlist(Long entryId, String email, boolean isAdmin) {
        Waitlist entry = waitlistRepository.findById(entryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Waitlist entry not found"));

        // Only the owner or an admin can remove
        if (!isAdmin && !entry.getUser().getEmail().equals(email)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorised to remove this entry");
        }

        Long equipmentId = entry.getEquipment().getId();
        int removedPosition = entry.getPosition();

        waitlistRepository.delete(entry);

        // Rebalance positions for remaining WAITING entries
        List<Waitlist> remaining = waitlistRepository.findWaitingByEquipmentIdOrdered(equipmentId);
        int pos = 1;
        for (Waitlist w : remaining) {
            if (w.getPosition() > removedPosition) {
                w.setPosition(pos);
                waitlistRepository.save(w);
            }
            pos++;
        }
    }

    /** Notify the first person in the queue when equipment becomes available and auto-book */
    @Transactional
    public void notifyNext(Long equipmentId) {
        List<Waitlist> queue = waitlistRepository.findWaitingByEquipmentIdOrdered(equipmentId);
        if (!queue.isEmpty()) {
            Waitlist first = queue.get(0);
            first.setStatus(WaitlistStatus.NOTIFIED);
            first.setNotifiedAt(java.time.LocalDateTime.now());
            waitlistRepository.save(first);

            // Auto-create booking request
            Booking booking = new Booking();
            booking.setUser(first.getUser());
            booking.setEquipment(first.getEquipment());
            booking.setStartTime(first.getStartTime());
            booking.setEndTime(first.getEndTime());
            booking.setQuantity(first.getQuantity());
            booking.setPurpose(first.getPurpose());
            booking.setStatus(BookingStatus.PENDING_APPROVAL);
            bookingRepository.save(booking);
            
            // Send waitlist promotion email using proper DTO
            sendWaitlistPromotionEmail(first);

            // Add in-app dashboard notification to user
            notificationService.createNotification(
                first.getUser(),
                "Waitlist Converted to Booking",
                "Your waitlist request for '" + first.getEquipment().getName() + "' has been automatically converted into a pending booking request.",
                "INFO"
            );

            // Notify lab managers about the new pending booking
            List<User> managers = userRepository.findByRole(Role.LAB_MANAGER);
            for (User manager : managers) {
                notificationService.createNotification(
                    manager, 
                    "New Auto-Booking from Waitlist", 
                    first.getUser().getName() + " was automatically booked for " + first.getEquipment().getName() + " from the waitlist.", 
                    "INFO"
                );
            }
        }
    }
    
    /**
     * Send waitlist promotion email notification
     */
    private void sendWaitlistPromotionEmail(Waitlist waitlist) {
        try {
            java.time.format.DateTimeFormatter dateTimeFormatter = java.time.format.DateTimeFormatter.ofPattern("MMM dd, yyyy hh:mm a");
            
            String fromDateTime = waitlist.getStartTime().format(dateTimeFormatter);
            String toDateTime = waitlist.getEndTime().format(dateTimeFormatter);
            
            com.example.lab_resource_utilization.dto.WaitlistPromotionEmailDTO emailDTO = 
                new com.example.lab_resource_utilization.dto.WaitlistPromotionEmailDTO();
            emailDTO.setToEmail(waitlist.getUser().getEmail());
            emailDTO.setUserName(waitlist.getUser().getName());
            emailDTO.setEquipmentName(waitlist.getEquipment().getName());
            emailDTO.setBookingDate(null);
            emailDTO.setBookingTime("from " + fromDateTime + " to " + toDateTime);
            emailDTO.setNewBookingStatus("PENDING_APPROVAL");
            emailDTO.setConfirmationMessage("Your waitlist request has been automatically converted to a booking. Please wait for manager approval.");;
                
            emailService.sendWaitlistPromotionEmail(emailDTO);
        } catch (Exception e) {
            System.err.println("❌ Failed to send waitlist promotion email: " + e.getMessage());
        }
    }
}
