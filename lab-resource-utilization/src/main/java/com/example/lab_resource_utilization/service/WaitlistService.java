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
        waitlistRepository.findByUserEmailAndEquipmentId(email, request.getEquipmentId())
                .ifPresent(w -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT,
                            "You are already on the waitlist for this equipment");
                });

        // Calculate next position
        int nextPosition = waitlistRepository.countWaitingByEquipmentId(request.getEquipmentId()) + 1;

        Waitlist entry = new Waitlist();
        entry.setUser(user);
        entry.setEquipment(equipment);
        entry.setPosition(nextPosition);
        entry.setStatus(WaitlistStatus.WAITING);

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

    /** Notify the first person in the queue when equipment becomes available */
    @Transactional
    public void notifyNext(Long equipmentId) {
        List<Waitlist> queue = waitlistRepository.findWaitingByEquipmentIdOrdered(equipmentId);
        if (!queue.isEmpty()) {
            Waitlist first = queue.get(0);
            first.setStatus(WaitlistStatus.NOTIFIED);
            waitlistRepository.save(first);
            
            // Send email notification to the user
            emailService.sendWaitlistNotification(
                first.getUser().getEmail(), 
                first.getUser().getName(), 
                first.getEquipment().getName()
            );

            // Add in-app dashboard notification
            notificationService.createNotification(
                first.getUser(),
                "Equipment Available",
                "The equipment '" + first.getEquipment().getName() + "' you were waitlisting is now available. You are next in line!",
                "INFO"
            );
        }
    }
}
