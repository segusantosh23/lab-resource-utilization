package com.example.lab_resource_utilization.service;

import com.example.lab_resource_utilization.dto.BookingRequest;
import com.example.lab_resource_utilization.dto.BookingResponse;
import com.example.lab_resource_utilization.entity.*;
import com.example.lab_resource_utilization.exception.InvalidBookingException;
import com.example.lab_resource_utilization.exception.ResourceNotFoundException;
import com.example.lab_resource_utilization.repository.BookingRepository;
import com.example.lab_resource_utilization.repository.EquipmentRepository;
import com.example.lab_resource_utilization.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EquipmentRepository equipmentRepository;

    @InjectMocks
    private BookingService bookingService;

    private User researcher;
    private User manager;
    private Equipment equipment;
    private BookingRequest request;

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

        equipment = new Equipment();
        equipment.setId(10L);
        equipment.setName("Spectrometer");
        equipment.setStatus(EquipmentStatus.AVAILABLE);

        request = new BookingRequest();
        request.setEquipmentId(10L);
        request.setStartTime(LocalDateTime.now().plusDays(1));
        request.setEndTime(LocalDateTime.now().plusDays(2));
        request.setPurpose("Physics research project");
    }

    @Test
    void createBooking_Success() {
        when(userRepository.findByEmail(researcher.getEmail())).thenReturn(Optional.of(researcher));
        when(equipmentRepository.findById(equipment.getId())).thenReturn(Optional.of(equipment));
        
        Booking savedBooking = new Booking();
        savedBooking.setId(100L);
        savedBooking.setUser(researcher);
        savedBooking.setEquipment(equipment);
        savedBooking.setStartTime(request.getStartTime());
        savedBooking.setEndTime(request.getEndTime());
        savedBooking.setPurpose(request.getPurpose());
        savedBooking.setStatus(BookingStatus.PENDING_APPROVAL);

        when(bookingRepository.save(any(Booking.class))).thenReturn(savedBooking);

        BookingResponse response = bookingService.createBooking(request, researcher.getEmail());

        assertNotNull(response);
        assertEquals(100L, response.getId());
        assertEquals(BookingStatus.PENDING_APPROVAL, response.getStatus());
        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    @Test
    void createBooking_EquipmentNotAvailable_ThrowsException() {
        equipment.setStatus(EquipmentStatus.UNDER_MAINTENANCE);
        when(userRepository.findByEmail(researcher.getEmail())).thenReturn(Optional.of(researcher));
        when(equipmentRepository.findById(equipment.getId())).thenReturn(Optional.of(equipment));

        assertThrows(InvalidBookingException.class, () -> 
            bookingService.createBooking(request, researcher.getEmail())
        );

        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void updateBooking_NotOwner_ThrowsException() {
        Booking booking = new Booking();
        booking.setId(100L);
        booking.setUser(manager); // owned by manager
        booking.setEquipment(equipment);
        booking.setStatus(BookingStatus.PENDING_APPROVAL);

        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(userRepository.findByEmail(researcher.getEmail())).thenReturn(Optional.of(researcher)); // currentUser is researcher

        assertThrows(InvalidBookingException.class, () -> 
            bookingService.updateBooking(100L, request, researcher.getEmail())
        );
    }
}
