package com.example.lab_resource_utilization.service;

import com.example.lab_resource_utilization.dto.BookingResponse;
import com.example.lab_resource_utilization.entity.*;
import com.example.lab_resource_utilization.exception.InvalidBookingException;
import com.example.lab_resource_utilization.repository.BookingRepository;
import com.example.lab_resource_utilization.repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingLifecycleServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BookingService bookingService;

    @InjectMocks
    private BookingLifecycleService bookingLifecycleService;

    private User researcher;
    private User manager;
    private Booking booking;

    @BeforeEach
    void setUp() {
        researcher = new User();
        researcher.setId(1L);
        researcher.setName("Researcher");
        researcher.setEmail("researcher@test.com");
        researcher.setRole(Role.RESEARCHER);

        manager = new User();
        manager.setId(2L);
        manager.setName("Manager");
        manager.setEmail("manager@test.com");
        manager.setRole(Role.LAB_MANAGER);

        booking = new Booking();
        booking.setId(100L);
        booking.setUser(researcher);
        booking.setStatus(BookingStatus.PENDING_APPROVAL);
    }

    @Test
    void confirmBooking_Success_ByManager() {
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(userRepository.findByEmail(manager.getEmail())).thenReturn(Optional.of(manager));
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);

        BookingResponse mockResponse = new BookingResponse();
        mockResponse.setId(100L);
        mockResponse.setStatus(BookingStatus.CONFIRMED);
        when(bookingService.mapToResponse(any(Booking.class))).thenReturn(mockResponse);

        // ✅ FIX: prevent null issue
        doNothing().when(notificationService).notifyBookingStatusChange(any(Booking.class));

        BookingResponse response = bookingLifecycleService.updateBookingStatus(
                100L, BookingStatus.CONFIRMED, manager.getEmail());

        assertNotNull(response);
        assertEquals(BookingStatus.CONFIRMED, response.getStatus());
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

    @Test
    void cancelBooking_Success_ByOwner() {
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(userRepository.findByEmail(researcher.getEmail())).thenReturn(Optional.of(researcher));
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);

        BookingResponse mockResponse = new BookingResponse();
        mockResponse.setId(100L);
        mockResponse.setStatus(BookingStatus.CANCELLED);
        when(bookingService.mapToResponse(any(Booking.class))).thenReturn(mockResponse);

        // ✅ FIX: prevent null issue
        doNothing().when(notificationService).notifyBookingStatusChange(any(Booking.class));

        BookingResponse response = bookingLifecycleService.updateBookingStatus(
                100L, BookingStatus.CANCELLED, researcher.getEmail());

        assertNotNull(response);
        assertEquals(BookingStatus.CANCELLED, response.getStatus());
    }

    @Test
    void invalidTransition_ThrowsException() {
        booking.setStatus(BookingStatus.IN_USE);

        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(userRepository.findByEmail(manager.getEmail())).thenReturn(Optional.of(manager));

        assertThrows(InvalidBookingException.class, () ->
                bookingLifecycleService.updateBookingStatus(
                        100L, BookingStatus.CONFIRMED, manager.getEmail())
        );
    }
}