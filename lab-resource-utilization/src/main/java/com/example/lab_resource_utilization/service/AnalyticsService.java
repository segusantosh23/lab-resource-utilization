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
import com.example.lab_resource_utilization.repository.UserRepository;
import com.example.lab_resource_utilization.entity.User;
import com.example.lab_resource_utilization.entity.Role;
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
    private UserRepository userRepository;
    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private WaitlistRepository waitlistRepository;

    public UtilizationResponse getUtilizationAnalytics(String email) {

    UtilizationResponse r = new UtilizationResponse();

    // Get logged-in user
    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

    Role role = user.getRole();
    String department = user.getDepartment();
    
    String institution = user.getInstitution();


    // ================= EQUIPMENT FILTER =================

    List<Equipment> filteredEquipment;

    if (role == Role.LAB_MANAGER ||
    role == Role.DEPARTMENT_HEAD) {

    filteredEquipment =
            equipmentRepository.findByDepartmentAndInstitution(
                    department,
                    institution
            );

}
    else if (role == Role.INSTITUTION_ADMIN) {

        filteredEquipment =
                equipmentRepository.findByInstitution(institution);

    } 
    else {

        filteredEquipment =
                equipmentRepository.findAll();

    }
  // ================= BOOKING FILTER =================

List<Booking> filteredBookings;

if (role == Role.RESEARCHER) {

    filteredBookings =
        bookingRepository.findByUserId(user.getId());

}
else if (role == Role.LAB_MANAGER ||
         role == Role.DEPARTMENT_HEAD) {

    filteredBookings =
            bookingRepository.findByEquipmentDepartmentAndEquipmentInstitution(
                    department,
                    institution
            );
}
else if (role == Role.INSTITUTION_ADMIN) {

    filteredBookings =
        bookingRepository.findByEquipmentInstitution(institution);

}
else {

    filteredBookings =
        bookingRepository.findAll();

}

    // ================= EQUIPMENT COUNTS =================

    long totalEquipment = filteredEquipment.size();

    long availableEquipment = filteredEquipment.stream()
            .filter(e -> e.getStatus() == EquipmentStatus.AVAILABLE)
            .count();

    long bookedEquipment = filteredEquipment.stream()
            .filter(e -> e.getStatus() == EquipmentStatus.BOOKED)
            .count();

    long underMaintenance = filteredEquipment.stream()
            .filter(e -> e.getStatus() == EquipmentStatus.UNDER_MAINTENANCE)
            .count();

    long outOfService = filteredEquipment.stream()
            .filter(e -> e.getStatus() == EquipmentStatus.OUT_OF_SERVICE)
            .count();

    long retired = filteredEquipment.stream()
            .filter(e -> e.getStatus() == EquipmentStatus.RETIRED)
            .count();


    r.setTotalEquipment(totalEquipment);
    r.setAvailableEquipment(availableEquipment);
    r.setBookedEquipment(bookedEquipment);
    r.setUnderMaintenanceEquipment(underMaintenance);
    r.setOutOfServiceEquipment(outOfService);
    r.setRetiredEquipment(retired);



    // ================= BOOKING COUNTS =================

    long totalBookings = filteredBookings.size();

    long pending = filteredBookings.stream()
        .filter(b -> b.getStatus() == BookingStatus.PENDING_APPROVAL)
        .count();

long confirmed = filteredBookings.stream()
        .filter(b -> b.getStatus() == BookingStatus.CONFIRMED)
        .count();

long inUse = filteredBookings.stream()
        .filter(b -> b.getStatus() == BookingStatus.IN_USE)
        .count();

long completed = filteredBookings.stream()
        .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
        .count();

long cancelled = filteredBookings.stream()
        .filter(b -> b.getStatus() == BookingStatus.CANCELLED)
        .count();

long rejected = filteredBookings.stream()
        .filter(b -> b.getStatus() == BookingStatus.REJECTED)
        .count();


    r.setTotalBookings(totalBookings);
    r.setPendingBookings(pending);
    r.setConfirmedBookings(confirmed);
    r.setInUseBookings(inUse);
    r.setCompletedBookings(completed);
    r.setCancelledBookings(cancelled);
    r.setRejectedBookings(rejected);



    // ================= UTILIZATION =================

    long utilizedEquipment =
            bookingRepository.countDistinctEquipmentByStatuses(
                    Arrays.asList(
                            BookingStatus.CONFIRMED,
                            BookingStatus.IN_USE
                    )
            );


    double utilizationPercentage =
            totalEquipment > 0
                    ?
                    ((double) utilizedEquipment / totalEquipment) * 100
                    :
                    0;


    r.setUtilizationPercentage(
            Math.round(utilizationPercentage * 10.0) / 10.0
    );



    // ================= COMPLETION RATE =================

    long closedBookings =
            completed + cancelled + rejected;


    double completionRate =
            closedBookings > 0
                    ?
                    ((double) completed / closedBookings) * 100
                    :
                    0;


    r.setCompletionRate(
            Math.round(completionRate * 10.0) / 10.0
    );



    // ================= APPROVAL RATE =================

    long decidedBookings =
            confirmed + rejected;


    double approvalRate =
            decidedBookings > 0
                    ?
                    ((double) confirmed / decidedBookings) * 100
                    :
                    0;


    r.setApprovalRate(
            Math.round(approvalRate * 10.0) / 10.0
    );



    // ================= WAITLIST =================

    long waitlistCount =
            waitlistRepository.findAll()
                    .stream()
                    .filter(w ->
                            w.getStatus() == WaitlistStatus.WAITING)
                    .count();


    r.setWaitlistCount(waitlistCount);


    return r;
}
    public List<RealTimeUsageDTO> getRealTimeTracking(String email) {
        List<RealTimeUsageDTO> trackingList = new ArrayList<>();
       User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("User not found"));

Role role = user.getRole();

List<Booking> activeBookings;


if (role == Role.LAB_MANAGER ||
    role == Role.DEPARTMENT_HEAD) {

    activeBookings =
        bookingRepository.findByEquipmentDepartmentAndEquipmentInstitution(
            user.getDepartment(),
            user.getInstitution()
        );

}
else if (role == Role.INSTITUTION_ADMIN) {

    activeBookings =
        bookingRepository.findByEquipmentInstitution(
            user.getInstitution()
        );

}
else {

    activeBookings =
        bookingRepository.findByEquipmentDepartmentAndEquipmentInstitution(
            user.getDepartment(),
            user.getInstitution()
        );

}


activeBookings = activeBookings.stream()
        .filter(b -> b.getStatus() == BookingStatus.IN_USE)
        .toList();
        for (Booking b : activeBookings) {
            String userName = b.getUser() != null ? b.getUser().getName() : "Unknown";
            trackingList.add(new RealTimeUsageDTO(
                    b.getEquipment().getId(),
                    b.getEquipment().getName(),
                    "", // Category field removed from Equipment
                    b.getEquipment().getStatus().name(),
                    userName,
                    b.getStartTime(),
                    b.getEndTime()
            ));
        }
        return trackingList;
    }

    public List<EquipmentUtilizationDTO> getEquipmentUtilizationRates(String email) {
       User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("User not found"));

Role role = user.getRole();

List<Equipment> allEquipment;

if (role == Role.LAB_MANAGER ||
    role == Role.DEPARTMENT_HEAD) {

    allEquipment =
        equipmentRepository.findByDepartmentAndInstitution(
            user.getDepartment(),
            user.getInstitution()
        );

}
else if (role == Role.INSTITUTION_ADMIN) {

    allEquipment =
        equipmentRepository.findByInstitution(
            user.getInstitution()
        );

}
else {

    allEquipment =
        equipmentRepository.findByDepartmentAndInstitution(
            user.getDepartment(),
            user.getInstitution()
        );

}
        List<Long> equipmentIds = allEquipment.stream()
        .map(Equipment::getId)
        .toList();


LocalDateTime now = LocalDateTime.now();
LocalDateTime thirtyDaysAgo = now.minusDays(30);


List<Booking> recentBookings = bookingRepository.findAll().stream()
        .filter(b -> equipmentIds.contains(b.getEquipment().getId()))
        .filter(b -> b.getStartTime() != null && b.getEndTime() != null)
        .filter(b -> b.getStartTime().isAfter(thirtyDaysAgo)
                || b.getEndTime().isAfter(thirtyDaysAgo))
        .filter(b -> b.getStatus() == BookingStatus.COMPLETED
                || b.getStatus() == BookingStatus.CONFIRMED)
        .toList();
        // 30 days * 8 hours/day = 240 hours
        double availableHours = 30 * 8.0;

        List<EquipmentUtilizationDTO> result = new ArrayList<>();
        for (Equipment eq : allEquipment) {
            double totalBookedHours = calculateCappedBookedHours(eq.getId(), recentBookings, thirtyDaysAgo, now);
            double rate = (totalBookedHours / availableHours) * 100.0;
            if (rate > 100.0) rate = 100.0;
            result.add(new EquipmentUtilizationDTO(
                    eq.getId(), eq.getName(), "", Math.round(rate * 10.0) / 10.0, // Category field removed
                    Math.round(totalBookedHours * 10.0) / 10.0, availableHours
            ));
        }
        
        result.sort((a, b) -> Double.compare(b.getUtilizationRate(), a.getUtilizationRate()));
        return result;
    }

    public List<GroupUtilizationDTO> getDepartmentUtilizationRates(String email) {
    return getGroupUtilizationRates(true, email);
}

    public List<GroupUtilizationDTO> getInstitutionUtilizationRates(String email) {
    return getGroupUtilizationRates(false, email);
}

    private List<GroupUtilizationDTO> getGroupUtilizationRates(
        boolean byDepartment,
        String email) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime thirtyDaysAgo = now.minusDays(30);
        User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("User not found"));

Role role = user.getRole();

List<Booking> recentBookings;

if (role == Role.LAB_MANAGER ||
    role == Role.DEPARTMENT_HEAD) {

    recentBookings = bookingRepository.findAll().stream()
            .filter(b -> b.getEquipment() != null)
            .filter(b -> b.getEquipment().getDepartment()
                    .equals(user.getDepartment()))
            .filter(b -> b.getEquipment().getInstitution()
                    .equals(user.getInstitution()))
            .filter(b -> b.getStartTime() != null && b.getEndTime() != null)
            .filter(b -> b.getStartTime().isAfter(thirtyDaysAgo)
                    || b.getEndTime().isAfter(thirtyDaysAgo))
            .filter(b -> b.getStatus() == BookingStatus.COMPLETED
                    || b.getStatus() == BookingStatus.CONFIRMED)
            .toList();

} else {

    recentBookings = bookingRepository.findAll().stream()
            .filter(b -> b.getStartTime() != null && b.getEndTime() != null)
            .filter(b -> b.getStartTime().isAfter(thirtyDaysAgo)
                    || b.getEndTime().isAfter(thirtyDaysAgo))
            .filter(b -> b.getStatus() == BookingStatus.COMPLETED
                    || b.getStatus() == BookingStatus.CONFIRMED)
            .toList();
}

       

List<Equipment> allEquipment;

if(role == Role.LAB_MANAGER ||
   role == Role.DEPARTMENT_HEAD){

    allEquipment =
        equipmentRepository.findByDepartmentAndInstitution(
            user.getDepartment(),
            user.getInstitution()
        );

}
else if(role == Role.INSTITUTION_ADMIN){

    allEquipment =
        equipmentRepository.findByInstitution(
            user.getInstitution()
        );

}
else{

    allEquipment =
        equipmentRepository.findAll();

}
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

    public List<IdleEquipmentDTO> getIdleEquipment(String email){
        // Equipment is idle if it is AVAILABLE and hasn't had a booking in the last 14 days
        User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("User not found"));

Role role = user.getRole();
List<Equipment> allEquipment;
if(role == Role.LAB_MANAGER ||
   role == Role.DEPARTMENT_HEAD){

    allEquipment =
        equipmentRepository.findByDepartmentAndInstitution(
            user.getDepartment(),
            user.getInstitution()
        );

}
else if(role == Role.INSTITUTION_ADMIN){

    allEquipment =
        equipmentRepository.findByInstitution(
            user.getInstitution()
        );

}
else{
    allEquipment = new ArrayList<>();
}
allEquipment = allEquipment.stream()
        .filter(e -> e.getStatus()==EquipmentStatus.AVAILABLE)
        .toList();
        List<IdleEquipmentDTO> idleList = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        List<Long> equipmentIds = allEquipment.stream()
        .map(Equipment::getId)
        .toList();

List<Booking> allBookings = bookingRepository.findAll()
        .stream()
        .filter(b -> equipmentIds.contains(b.getEquipment().getId()))
        .toList();

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
                idleList.add(new IdleEquipmentDTO(eq.getId(), eq.getName(), "", daysIdle)); // Category field removed
            }
        }
        
        idleList.sort((a, b) -> Long.compare(b.getDaysIdle(), a.getDaysIdle()));
        return idleList;
    }

    public Map<String, Map<Integer,Integer>> getUtilizationHeatmap(String email){
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
       User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("User not found"));

Role role = user.getRole();

List<Booking> recentBookings;
if(role == Role.LAB_MANAGER ||
   role == Role.DEPARTMENT_HEAD){

    recentBookings =
        bookingRepository.findByEquipmentDepartmentAndEquipmentInstitution(
            user.getDepartment(),
            user.getInstitution()
        );

}
else if(role == Role.INSTITUTION_ADMIN){

    recentBookings =
        bookingRepository.findByEquipmentInstitution(
            user.getInstitution()
        );

}
else{

    recentBookings =
        bookingRepository.findByEquipmentDepartmentAndEquipmentInstitution(
            user.getDepartment(),
            user.getInstitution()
        );
}
recentBookings = recentBookings.stream()
        .filter(b -> b.getStartTime() != null && b.getEndTime() != null)
        .filter(b -> b.getStartTime().isAfter(thirtyDaysAgo)
                || b.getEndTime().isAfter(thirtyDaysAgo))
        .filter(b -> b.getStatus() == BookingStatus.COMPLETED
                || b.getStatus() == BookingStatus.CONFIRMED
                || b.getStatus() == BookingStatus.IN_USE)
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

   public UsagePatternDTO getUsagePatterns(String email){
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("User not found"));

Role role = user.getRole();

List<Booking> recentBookings;


if(role == Role.LAB_MANAGER ||
   role == Role.DEPARTMENT_HEAD){

    recentBookings =
       bookingRepository
       .findByEquipmentDepartmentAndEquipmentInstitution(
          user.getDepartment(),
          user.getInstitution()
       );

}
else if(role == Role.INSTITUTION_ADMIN){

    recentBookings =
       bookingRepository
       .findByEquipmentInstitution(
          user.getInstitution()
       );

}
else{

    recentBookings =
       bookingRepository.findAll();

}

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
