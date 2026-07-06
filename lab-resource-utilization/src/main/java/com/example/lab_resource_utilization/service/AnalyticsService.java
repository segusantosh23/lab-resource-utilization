package com.example.lab_resource_utilization.service;

import com.example.lab_resource_utilization.dto.UtilizationResponse;
import com.example.lab_resource_utilization.entity.BookingStatus;
import com.example.lab_resource_utilization.entity.EquipmentStatus;
import com.example.lab_resource_utilization.entity.WaitlistStatus;
import com.example.lab_resource_utilization.repository.BookingRepository;
import com.example.lab_resource_utilization.repository.EquipmentRepository;
import com.example.lab_resource_utilization.repository.WaitlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;

@Service
public class AnalyticsService {

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private WaitlistRepository waitlistRepository;

    public UtilizationResponse getUtilizationAnalytics() {

        UtilizationResponse r = new UtilizationResponse();

        // ── Equipment counts ───────────────────────────────────
        long totalEquipment = equipmentRepository.count();
        r.setTotalEquipment(totalEquipment);
        r.setAvailableEquipment(equipmentRepository.findByStatus(EquipmentStatus.AVAILABLE).size());
        r.setBookedEquipment(equipmentRepository.findByStatus(EquipmentStatus.BOOKED).size());
        r.setUnderMaintenanceEquipment(equipmentRepository.findByStatus(EquipmentStatus.UNDER_MAINTENANCE).size());
        r.setOutOfServiceEquipment(equipmentRepository.findByStatus(EquipmentStatus.OUT_OF_SERVICE).size());
        r.setRetiredEquipment(equipmentRepository.findByStatus(EquipmentStatus.RETIRED).size());

        // ── Booking counts ─────────────────────────────────────
        long totalBookings    = bookingRepository.count();
        long pending          = bookingRepository.countByStatus(BookingStatus.PENDING_APPROVAL);
        long confirmed        = bookingRepository.countByStatus(BookingStatus.CONFIRMED);
        long inUse            = bookingRepository.countByStatus(BookingStatus.IN_USE);
        long completed        = bookingRepository.countByStatus(BookingStatus.COMPLETED);
        long cancelled        = bookingRepository.countByStatus(BookingStatus.CANCELLED);
        long rejected         = bookingRepository.countByStatus(BookingStatus.REJECTED);

        r.setTotalBookings(totalBookings);
        r.setPendingBookings(pending);
        r.setConfirmedBookings(confirmed);
        r.setInUseBookings(inUse);
        r.setCompletedBookings(completed);
        r.setCancelledBookings(cancelled);
        r.setRejectedBookings(rejected);

        // ── Utilization % = equipment with active bookings / total ──
        long utilizedEquipment = bookingRepository.countDistinctEquipmentByStatuses(
                Arrays.asList(BookingStatus.CONFIRMED, BookingStatus.IN_USE));
        double utilizationPct = totalEquipment > 0
                ? ((double) utilizedEquipment / totalEquipment) * 100.0 : 0;
        r.setUtilizationPercentage(Math.round(utilizationPct * 10.0) / 10.0);

        // ── Completion rate = completed / (completed + cancelled + rejected) ──
        long closedBookings = completed + cancelled + rejected;
        double completionRate = closedBookings > 0
                ? ((double) completed / closedBookings) * 100.0 : 0;
        r.setCompletionRate(Math.round(completionRate * 10.0) / 10.0);

        // ── Approval rate = confirmed / (confirmed + rejected) ──
        long decidedBookings = confirmed + rejected;
        double approvalRate = decidedBookings > 0
                ? ((double) confirmed / decidedBookings) * 100.0 : 0;
        r.setApprovalRate(Math.round(approvalRate * 10.0) / 10.0);

        // ── Waitlist count ─────────────────────────────────────
        long waitlistCount = waitlistRepository.findAll().stream()
                .filter(w -> w.getStatus() == WaitlistStatus.WAITING)
                .count();
        r.setWaitlistCount(waitlistCount);

        return r;
    }
}
