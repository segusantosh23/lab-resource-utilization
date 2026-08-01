package com.example.lab_resource_utilization.service;

import com.example.lab_resource_utilization.dto.BookingResponse;
import com.example.lab_resource_utilization.entity.*;
import com.example.lab_resource_utilization.exception.InvalidBookingException;
import com.example.lab_resource_utilization.repository.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.any;

@ExtendWith(MockitoExtension.class)
class BookingLifecycleServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private EquipmentRepository equipmentRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private MaintenanceRepository maintenanceRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BookingService bookingService;

    @InjectMocks
    private BookingLifecycleService bookingLifecycleService;

    private User researcher;
    private User manager;
    private Booking booking;
    private Equipment equipment;

    @BeforeEach
    void setUp() {

        researcher = new User();
        researcher.setId(1L);
        researcher.setEmail("researcher@test.com");
        researcher.setRole(Role.RESEARCHER);

        manager = new User();
        manager.setId(2L);
        manager.setEmail("manager@test.com");
        manager.setRole(Role.LAB_MANAGER);

        equipment = new Equipment();
        equipment.setName("Microscope");
        equipment.setQuantity(5);
        equipment.setStatus(EquipmentStatus.AVAILABLE);

        booking = new Booking();
        booking.setId(100L);
        booking.setUser(researcher);
        booking.setEquipment(equipment);
        booking.setQuantity(1);
        booking.setStatus(BookingStatus.PENDING_APPROVAL);
    }

    @Test
    void confirmBooking_Success_ByManager() {

        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(userRepository.findByEmail(manager.getEmail())).thenReturn(Optional.of(manager));
        when(bookingRepository.save(any())).thenReturn(booking);

        BookingResponse responseMock = new BookingResponse();
        responseMock.setId(100L);
        responseMock.setStatus(BookingStatus.CONFIRMED);

        when(bookingService.mapToResponse(any())).thenReturn(responseMock);
        doNothing().when(notificationService).notifyBookingStatusChange(any());

        BookingResponse response = bookingLifecycleService.updateBookingStatus(
                100L, BookingStatus.CONFIRMED, manager.getEmail());

        assertNotNull(response);
        assertEquals(BookingStatus.CONFIRMED, response.getStatus());
    }

    @Test
    void cancelBooking_Success_ByOwner() {

        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(userRepository.findByEmail(researcher.getEmail())).thenReturn(Optional.of(researcher));
        when(bookingRepository.save(any())).thenReturn(booking);

        BookingResponse responseMock = new BookingResponse();
        responseMock.setId(100L);
        responseMock.setStatus(BookingStatus.CANCELLED);

        when(bookingService.mapToResponse(any())).thenReturn(responseMock);
        doNothing().when(notificationService).notifyBookingStatusChange(any());

        BookingResponse response = bookingLifecycleService.updateBookingStatus(
                100L, BookingStatus.CANCELLED, researcher.getEmail());

        assertNotNull(response);
        assertEquals(BookingStatus.CANCELLED, response.getStatus());
    }

    @Test
    void confirmBooking_Failure_ByResearcher() {

        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(userRepository.findByEmail(researcher.getEmail())).thenReturn(Optional.of(researcher));

        assertThrows(InvalidBookingException.class, () ->
                bookingLifecycleService.updateBookingStatus(
                        100L, BookingStatus.CONFIRMED, researcher.getEmail())
        );
    }
}