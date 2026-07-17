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

import com.example.lab_resource_utilization.dto.RealTimeUsageDTO;
import com.example.lab_resource_utilization.dto.EquipmentUtilizationDTO;
import com.example.lab_resource_utilization.dto.GroupUtilizationDTO;
import com.example.lab_resource_utilization.dto.IdleEquipmentDTO;
import com.example.lab_resource_utilization.dto.UsagePatternDTO;
import com.example.lab_resource_utilization.entity.Booking;
import com.example.lab_resource_utilization.entity.Equipment;
import java.time.LocalDateTime;
import java.time.Duration;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

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

        // ── Historical Benchmark (Days 31-60) ──
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        LocalDateTime sixtyDaysAgo = LocalDateTime.now().minusDays(60);
        
        List<Booking> historicalBookings = bookingRepository.findAll().stream()
                .filter(b -> b.getStartTime() != null && b.getEndTime() != null)
                .filter(b -> (b.getStartTime().isAfter(sixtyDaysAgo) && b.getStartTime().isBefore(thirtyDaysAgo)) || 
                             (b.getEndTime().isAfter(sixtyDaysAgo) && b.getEndTime().isBefore(thirtyDaysAgo)) ||
                             (b.getStartTime().isBefore(sixtyDaysAgo) && b.getEndTime().isAfter(thirtyDaysAgo)))
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED || b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.IN_USE)
                .toList();
        
        long historicalUtilizedCount = historicalBookings.stream()
                .map(b -> b.getEquipment().getId())
                .distinct()
                .count();
                
        double historicalPct = totalEquipment > 0
                ? ((double) historicalUtilizedCount / totalEquipment) * 100.0 : 0;
        r.setHistoricalUtilizationPercentage(Math.round(historicalPct * 10.0) / 10.0);

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

    public List<RealTimeUsageDTO> getRealTimeTracking() {
        List<RealTimeUsageDTO> trackingList = new ArrayList<>();
        List<Booking> activeBookings = bookingRepository.findByStatus(BookingStatus.IN_USE);
        for (Booking b : activeBookings) {
            String userName = b.getUser() != null ? b.getUser().getName() : "Unknown";
            trackingList.add(new RealTimeUsageDTO(
                    b.getEquipment().getId(),
                    b.getEquipment().getName(),
                    b.getEquipment().getCategory(),
                    b.getEquipment().getStatus().name(),
                    userName,
                    b.getStartTime(),
                    b.getEndTime()
            ));
        }
        return trackingList;
    }

    public List<EquipmentUtilizationDTO> getEquipmentUtilizationRates() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime thirtyDaysAgo = now.minusDays(30);
        List<Booking> recentBookings = bookingRepository.findAll().stream()
                .filter(b -> b.getStartTime() != null && b.getEndTime() != null)
                .filter(b -> b.getStartTime().isAfter(thirtyDaysAgo) || b.getEndTime().isAfter(thirtyDaysAgo))
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED || b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.IN_USE)
                .toList();

        List<Equipment> allEquipment = equipmentRepository.findAll();
        
        // 30 days * 8 hours/day = 240 hours
        double availableHours = 30 * 8.0;

        List<EquipmentUtilizationDTO> result = new ArrayList<>();
        for (Equipment eq : allEquipment) {
            double totalBookedHours = calculateCappedBookedHours(eq.getId(), recentBookings, thirtyDaysAgo, now);
            double rate = (totalBookedHours / availableHours) * 100.0;
            if (rate > 100.0) rate = 100.0;
            result.add(new EquipmentUtilizationDTO(
                    eq.getId(), eq.getName(), eq.getCategory(), Math.round(rate * 10.0) / 10.0,
                    Math.round(totalBookedHours * 10.0) / 10.0, availableHours
            ));
        }
        
        result.sort((a, b) -> Double.compare(b.getUtilizationRate(), a.getUtilizationRate()));
        return result;
    }

    public List<GroupUtilizationDTO> getDepartmentUtilizationRates() {
        return getGroupUtilizationRates(true);
    }

    public List<GroupUtilizationDTO> getInstitutionUtilizationRates() {
        return getGroupUtilizationRates(false);
    }

    private List<GroupUtilizationDTO> getGroupUtilizationRates(boolean byDepartment) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime thirtyDaysAgo = now.minusDays(30);
        List<Booking> recentBookings = bookingRepository.findAll().stream()
                .filter(b -> b.getStartTime() != null && b.getEndTime() != null)
                .filter(b -> b.getStartTime().isAfter(thirtyDaysAgo) || b.getEndTime().isAfter(thirtyDaysAgo))
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED || b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.IN_USE)
                .toList();

        List<Equipment> allEquipment = equipmentRepository.findAll();
        double availableHoursPerEq = 30 * 8.0;

        Map<String, Double> groupTotalBookedHours = new HashMap<>();
        Map<String, Integer> groupEquipmentCount = new HashMap<>();

        for (Equipment eq : allEquipment) {
            String groupName = byDepartment ? eq.getDepartment() : eq.getInstitution();
            if (groupName == null || groupName.trim().isEmpty()) {
                groupName = "Unassigned";
            }

            groupEquipmentCount.put(groupName, groupEquipmentCount.getOrDefault(groupName, 0) + 1);

            double bookedHoursForEq = calculateCappedBookedHours(eq.getId(), recentBookings, thirtyDaysAgo, now);
            groupTotalBookedHours.put(groupName, groupTotalBookedHours.getOrDefault(groupName, 0.0) + bookedHoursForEq);
        }

        List<GroupUtilizationDTO> result = new ArrayList<>();
        double targetRate = byDepartment ? 70.0 : 75.0; // Default targets

        for (String groupName : groupEquipmentCount.keySet()) {
            double totalBooked = groupTotalBookedHours.getOrDefault(groupName, 0.0);
            double totalAvailable = groupEquipmentCount.get(groupName) * availableHoursPerEq;
            double rate = totalAvailable > 0 ? (totalBooked / totalAvailable) * 100.0 : 0.0;
            if (rate > 100.0) rate = 100.0;
            result.add(new GroupUtilizationDTO(groupName, Math.round(rate * 10.0) / 10.0, targetRate));
        }

        result.sort((a, b) -> Double.compare(b.getUtilizationRate(), a.getUtilizationRate()));
        return result;
    }

    public List<IdleEquipmentDTO> getIdleEquipment() {
        // Equipment is idle if it is AVAILABLE and hasn't had a booking in the last 14 days
        List<Equipment> allEquipment = equipmentRepository.findByStatus(EquipmentStatus.AVAILABLE);
        List<IdleEquipmentDTO> idleList = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        List<Booking> allBookings = bookingRepository.findAll();

        for (Equipment eq : allEquipment) {
            LocalDateTime lastUsed = null;
            // find most recent booking end time
            for (Booking b : allBookings) {
                if (b.getEquipment().getId().equals(eq.getId()) && b.getEndTime() != null) {
                    if (lastUsed == null || b.getEndTime().isAfter(lastUsed)) {
                        lastUsed = b.getEndTime();
                    }
                }
            }
            
            long daysIdle;
            if (lastUsed == null) {
                // Never used, let's just say it's been idle since purchase date or assume a high number like 999
                daysIdle = 999;
            } else {
                daysIdle = ChronoUnit.DAYS.between(lastUsed, now);
            }

            if (daysIdle >= 14) {
                idleList.add(new IdleEquipmentDTO(eq.getId(), eq.getName(), eq.getCategory(), daysIdle));
            }
        }
        
        idleList.sort((a, b) -> Long.compare(b.getDaysIdle(), a.getDaysIdle()));
        return idleList;
    }

    public Map<String, Map<Integer, Integer>> getUtilizationHeatmap() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<Booking> recentBookings = bookingRepository.findAll().stream()
                .filter(b -> b.getStartTime() != null && b.getEndTime() != null)
                .filter(b -> b.getStartTime().isAfter(thirtyDaysAgo) || b.getEndTime().isAfter(thirtyDaysAgo))
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED || b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.IN_USE)
                .toList();

        Map<String, Map<Integer, Integer>> heatmap = new HashMap<>();
        List<String> days = Arrays.asList("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY");
        
        for (String day : days) {
            Map<Integer, Integer> hourMap = new HashMap<>();
            for (int i = 0; i < 24; i++) {
                hourMap.put(i, 0);
            }
            heatmap.put(day, hourMap);
        }

        for (Booking b : recentBookings) {
            LocalDateTime start = b.getStartTime().isBefore(thirtyDaysAgo) ? thirtyDaysAgo : b.getStartTime();
            String day = start.getDayOfWeek().name();
            int hour = start.getHour();
            
            Map<Integer, Integer> hourMap = heatmap.get(day);
            if (hourMap != null) {
                hourMap.put(hour, hourMap.get(hour) + 1);
            }
        }
        
        return heatmap;
    }

    private double calculateCappedBookedHours(Long equipmentId, List<Booking> recentBookings, LocalDateTime startDate, LocalDateTime endDate) {
        double totalHours = 0;
        
        for (LocalDateTime date = startDate; date.isBefore(endDate); date = date.plusDays(1)) {
            LocalDateTime startOfDay = date;
            LocalDateTime endOfDay = date.plusDays(1);
            
            double dailyBookedSeconds = 0;
            
            for (Booking b : recentBookings) {
                if (b.getEquipment().getId().equals(equipmentId)) {
                    LocalDateTime bStart = b.getStartTime();
                    LocalDateTime bEnd = b.getEndTime();
                    
                    LocalDateTime actualStart = bStart.isAfter(startOfDay) ? bStart : startOfDay;
                    LocalDateTime actualEnd = bEnd.isBefore(endOfDay) ? bEnd : endOfDay;
                    
                    if (actualStart.isBefore(actualEnd)) {
                        dailyBookedSeconds += Duration.between(actualStart, actualEnd).getSeconds();
                    }
                }
            }
            
            double dailyHours = dailyBookedSeconds / 3600.0;
            if (dailyHours > 8.0) {
                dailyHours = 8.0;
            }
            
            totalHours += dailyHours;
        }
        
        return totalHours;
    }

    public UsagePatternDTO getUsagePatterns() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<Booking> recentBookings = bookingRepository.findAll().stream()
                .filter(b -> b.getStartTime() != null && b.getEndTime() != null)
                .filter(b -> b.getStartTime().isAfter(thirtyDaysAgo) || b.getEndTime().isAfter(thirtyDaysAgo))
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED || b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.IN_USE)
                .toList();

        long shared = 0;
        long exclusive = 0;

        for (Booking b : recentBookings) {
            String userDept = b.getUser() != null ? b.getUser().getDepartment() : null;
            String eqDept = b.getEquipment() != null ? b.getEquipment().getDepartment() : null;

            if (userDept != null && userDept.equals(eqDept)) {
                exclusive++;
            } else {
                shared++;
            }
        }

        return new UsagePatternDTO(shared, exclusive);
    }
}
