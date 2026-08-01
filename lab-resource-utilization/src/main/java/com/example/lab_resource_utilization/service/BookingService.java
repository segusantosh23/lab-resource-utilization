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

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private com.example.lab_resource_utilization.repository.MaintenanceRepository maintenanceRepository;

    public BookingResponse mapToResponse(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        
        if (booking.getUser() != null) {
            response.setUserId(booking.getUser().getId());
            response.setUserName(booking.getUser().getName());
            response.setUserEmail(booking.getUser().getEmail());
            if (booking.getUser().getRole() != null) {
                response.setUserRole(booking.getUser().getRole().name());
            }
        }
        
        if (booking.getEquipment() != null) {
            response.setEquipmentId(booking.getEquipment().getId());
            response.setEquipmentName(booking.getEquipment().getName());
        }
        
        response.setStartTime(booking.getStartTime());
        response.setEndTime(booking.getEndTime());
        response.setStatus(booking.getStatus());
        response.setPurpose(booking.getPurpose());
        response.setQuantity(booking.getQuantity());
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
            throw new InvalidBookingException("Equipment is not available for booking.");
        }

        if (request.getStartTime().isBefore(LocalDateTime.now())) {
            throw new InvalidBookingException("Start time must be in the future.");
        }

        if (request.getEndTime().isBefore(request.getStartTime())) {
            throw new InvalidBookingException("End time must be after start time.");
        }

        validateNoConflict(equipment.getId(), equipment.getQuantity(), request.getQuantity(), request.getStartTime(), request.getEndTime(), null);

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setEquipment(equipment);
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setQuantity(request.getQuantity());
        booking.setStatus(BookingStatus.PENDING_APPROVAL);

        Booking savedBooking = bookingRepository.save(booking);

        if (savedBooking.getStatus() == BookingStatus.PENDING_APPROVAL) {
            List<User> managers =
        userRepository.findByRole(Role.LAB_MANAGER);

List<User> departmentHeads =
        userRepository.findByRole(Role.DEPARTMENT_HEAD);


managers.addAll(departmentHeads);

for(User manager : managers){

    if(manager.getDepartment()
            .equals(equipment.getDepartment())) {

        notificationService.createNotification(
            manager,
            "New Booking Request",
            user.getName()+" requested to book "
                    + equipment.getName(),
            "INFO"
        );
    }
}
        }

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
        // ✅ ADD THIS BLOCK HERE (VERY IMPORTANT)
        if (equipment.getStatus() != EquipmentStatus.AVAILABLE) {
            throw new InvalidBookingException("Equipment is not available for booking.");
        }

        if (request.getQuantity() > equipment.getQuantity()) {
            throw new InvalidBookingException("Requested quantity exceeds available equipment");
        }
        if (request.getQuantity() <= 0) {
            throw new InvalidBookingException("Invalid quantity requested");
        }
        if (equipment.getStatus() == EquipmentStatus.UNDER_MAINTENANCE ||
                equipment.getStatus() == EquipmentStatus.OUT_OF_SERVICE) {
            throw new InvalidBookingException("Equipment is not available for booking.");
        }

        if (request.getStartTime().isBefore(LocalDateTime.now())) {
            throw new InvalidBookingException("Start time must be in the future.");
        }

        if (request.getEndTime().isBefore(request.getStartTime())) {
            throw new InvalidBookingException("End time must be after start time.");
        }

        validateNoConflict(equipment.getId(), equipment.getQuantity(), request.getQuantity(), request.getStartTime(), request.getEndTime(), id);

        booking.setEquipment(equipment);
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setQuantity(request.getQuantity());

        Booking savedBooking = bookingRepository.save(booking);
        return mapToResponse(savedBooking);
    }

    public List<BookingResponse> getAllBookings(String email) {

    User manager = userRepository.findByEmail(email)
            .orElseThrow();

    List<Booking> bookings;


    if(manager.getRole() == Role.LAB_MANAGER) {

    bookings = bookingRepository
            .findByEquipmentDepartmentAndEquipmentInstitution(
                    manager.getDepartment(),
                    manager.getInstitution()
            );

} 
else if(manager.getRole() == Role.DEPARTMENT_HEAD) {

    bookings = bookingRepository
            .findByEquipmentDepartmentAndEquipmentInstitution(
                    manager.getDepartment(),
                    manager.getInstitution()
            );

}
    else {
        bookings = bookingRepository.findAll();
    }


    return bookings.stream()
            .map(this::mapToResponse)
            .toList();
}

    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        return mapToResponse(booking);
    }

    public List<BookingResponse> getUserBookings(String userEmail) {
        return bookingRepository.findByUserEmailOrderByCreatedAtDesc(userEmail)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private void validateNoConflict(Long equipmentId, Integer totalEquipmentQuantity, Integer requestedQuantity, LocalDateTime reqStart, LocalDateTime reqEnd, Long excludingBookingId) {
        List<BookingStatus> activeStatuses = List.of(
            BookingStatus.PENDING_APPROVAL,
            BookingStatus.CONFIRMED,
            BookingStatus.IN_USE
        );
        List<Booking> overlapping;
        if (excludingBookingId == null) {
            overlapping = bookingRepository.findOverlappingBookings(equipmentId, reqStart, reqEnd, activeStatuses);
        } else {
            overlapping = bookingRepository.findOverlappingBookingsExcludingId(equipmentId, excludingBookingId, reqStart, reqEnd, activeStatuses);
        }

        class Event implements Comparable<Event> {
            LocalDateTime time;
            int type; // 1 for start, -1 for end
            int qty;
            Event(LocalDateTime time, int type, int qty) {
                this.time = time; this.type = type; this.qty = qty;
            }
            @Override
            public int compareTo(Event o) {
                int cmp = this.time.compareTo(o.time);
                if (cmp == 0) return Integer.compare(this.type, o.type);
                return cmp;
            }
        }

        List<Event> events = new java.util.ArrayList<>();
        for (Booking b : overlapping) {
            LocalDateTime overlapStart = b.getStartTime().isAfter(reqStart) ? b.getStartTime() : reqStart;
            LocalDateTime overlapEnd = b.getEndTime().isBefore(reqEnd) ? b.getEndTime() : reqEnd;
            if (overlapStart.isBefore(overlapEnd)) {
                events.add(new Event(overlapStart, 1, b.getQuantity()));
                events.add(new Event(overlapEnd, -1, b.getQuantity()));
            }
        }

        java.util.Collections.sort(events);

        int currentUsage = 0;
        int maxUsage = 0;
        for (Event e : events) {
            if (e.type == 1) {
                currentUsage += e.qty;
                if (currentUsage > maxUsage) maxUsage = currentUsage;
            } else {
                currentUsage -= e.qty;
            }
        }

        // Subtract quantity that is currently under maintenance
        Equipment equipment = equipmentRepository.findById(equipmentId).orElse(null);
        int maintenanceQty = 0;
        if (equipment != null) {
            Integer mQty = maintenanceRepository.sumActiveMaintenanceQuantity(equipment.getName());
            if (mQty != null) maintenanceQty = mQty;
        }

        int availableQty = totalEquipmentQuantity - maintenanceQty;

        if (maxUsage + requestedQuantity > availableQty) {
            throw new InvalidBookingException("Insufficient equipment quantity available for the selected time slot. Available: " + (availableQty - maxUsage));
        }
    }
}
