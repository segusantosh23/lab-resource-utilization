package com.example.lab_resource_utilization.service;

import com.example.lab_resource_utilization.dto.*;
import com.example.lab_resource_utilization.entity.*;
import com.example.lab_resource_utilization.repository.*;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @InjectMocks
    private AnalyticsService analyticsService;

    @Mock private UserRepository userRepository;
    @Mock private EquipmentRepository equipmentRepository;
    @Mock private BookingRepository bookingRepository;
    @Mock private WaitlistRepository waitlistRepository;

    // ===============================
    // ✅ TEST 1: UTILIZATION ANALYTICS
    // ===============================
    @Test
    void testGetUtilizationAnalytics() {

        User user = new User();
        user.setId(1L);
        user.setEmail("test@gmail.com");
        user.setRole(Role.SYSTEM_ADMIN);

        when(userRepository.findByEmail("test@gmail.com"))
                .thenReturn(Optional.of(user));

        Equipment eq1 = new Equipment();
        eq1.setStatus(EquipmentStatus.AVAILABLE);

        Equipment eq2 = new Equipment();
        eq2.setStatus(EquipmentStatus.BOOKED);

        when(equipmentRepository.findAll())
                .thenReturn(List.of(eq1, eq2));

        Booking booking = new Booking();
        booking.setStatus(BookingStatus.CONFIRMED);

        when(bookingRepository.findAll())
                .thenReturn(List.of(booking));

        when(bookingRepository.countDistinctEquipmentByStatuses(anyList()))
                .thenReturn(1L);

        when(waitlistRepository.findAll())
                .thenReturn(new ArrayList<>());

        UtilizationResponse response =
                analyticsService.getUtilizationAnalytics("test@gmail.com");

        assertNotNull(response);
        assertEquals(2, response.getTotalEquipment());
        assertEquals(1, response.getBookedEquipment());
    }

    // ===============================
    // ✅ TEST 2: REAL-TIME TRACKING
    // ===============================
    @Test
    void testGetRealTimeTracking() {

        User user = new User();
        user.setDepartment("CSE");
        user.setInstitution("ABC");
        user.setRole(Role.LAB_MANAGER);

        when(userRepository.findByEmail("test@gmail.com"))
                .thenReturn(Optional.of(user));

        Equipment eq = new Equipment();
        eq.setId(1L);
        eq.setName("Microscope");
        eq.setStatus(EquipmentStatus.AVAILABLE);

        Booking booking = new Booking();
        booking.setEquipment(eq);
        booking.setStatus(BookingStatus.IN_USE);
        booking.setStartTime(LocalDateTime.now());
        booking.setEndTime(LocalDateTime.now().plusHours(2));

        when(bookingRepository.findByEquipmentDepartmentAndEquipmentInstitution(any(), any()))
                .thenReturn(List.of(booking));

        List<RealTimeUsageDTO> result =
                analyticsService.getRealTimeTracking("test@gmail.com");

        assertEquals(1, result.size());
    }

    // ===============================
    // ✅ TEST 3: EQUIPMENT UTILIZATION RATE
    // ===============================
    @Test
    void testGetEquipmentUtilizationRates() {

        User user = new User();
        user.setDepartment("CSE");
        user.setInstitution("ABC");
        user.setRole(Role.LAB_MANAGER);

        when(userRepository.findByEmail("test@gmail.com"))
                .thenReturn(Optional.of(user));

        Equipment eq = new Equipment();
        eq.setId(1L);
        eq.setName("Microscope");

        when(equipmentRepository.findByDepartmentAndInstitution(any(), any()))
                .thenReturn(List.of(eq));

        Booking booking = new Booking();
        booking.setEquipment(eq);
        booking.setStatus(BookingStatus.COMPLETED);
        booking.setStartTime(LocalDateTime.now().minusHours(2));
        booking.setEndTime(LocalDateTime.now());

        when(bookingRepository.findAll())
                .thenReturn(List.of(booking));

        List<EquipmentUtilizationDTO> result =
                analyticsService.getEquipmentUtilizationRates("test@gmail.com");

        assertNotNull(result);
        assertEquals(1, result.size());
    }



    //user not found
    @Test
    void testUserNotFound() {
        when(userRepository.findByEmail("wrong@gmail.com"))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () ->
                analyticsService.getUtilizationAnalytics("wrong@gmail.com"));
    }

    //empty data case

    @Test
    void testEmptyData() {

        User user = new User();
        user.setRole(Role.SYSTEM_ADMIN);

        when(userRepository.findByEmail(any()))
                .thenReturn(Optional.of(user));

        when(equipmentRepository.findAll())
                .thenReturn(new ArrayList<>());

        when(bookingRepository.findAll())
                .thenReturn(new ArrayList<>());

        when(waitlistRepository.findAll())
                .thenReturn(new ArrayList<>());

        UtilizationResponse response =
                analyticsService.getUtilizationAnalytics("test@gmail.com");

        assertEquals(0, response.getTotalEquipment());
        assertEquals(0, response.getTotalBookings());
    }
}