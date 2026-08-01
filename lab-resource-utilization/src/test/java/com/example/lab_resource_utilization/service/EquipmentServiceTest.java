package com.example.lab_resource_utilization.service;

import com.example.lab_resource_utilization.dto.EquipmentRequest;
import com.example.lab_resource_utilization.dto.EquipmentResponse;
import com.example.lab_resource_utilization.entity.Equipment;
import com.example.lab_resource_utilization.entity.EquipmentStatus;
import com.example.lab_resource_utilization.entity.Role;
import com.example.lab_resource_utilization.entity.User;
import com.example.lab_resource_utilization.repository.BookingRepository;
import com.example.lab_resource_utilization.repository.EquipmentRepository;
import com.example.lab_resource_utilization.repository.MaintenanceRepository;
import com.example.lab_resource_utilization.repository.UserRepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

@ExtendWith(MockitoExtension.class)
class EquipmentServiceTest {

    @InjectMocks
    private EquipmentService equipmentService;

    @Mock private EquipmentRepository repository;
    @Mock private UserRepository userRepository;
    @Mock private BookingRepository bookingRepository;
    @Mock private MaintenanceRepository maintenanceRepository;

    // ===============================
    // ✅ TEST: ADD EQUIPMENT
    // ===============================
    @Test
    void testAddEquipment() {

        EquipmentRequest request = new EquipmentRequest();
        request.setName("Microscope");
        request.setQuantity(5);
        request.setStatus(EquipmentStatus.AVAILABLE);

        Equipment saved = new Equipment();
        saved.setId(1L);
        saved.setName("Microscope");
        saved.setQuantity(5);
        saved.setStatus(EquipmentStatus.AVAILABLE);

        when(repository.save(any(Equipment.class))).thenReturn(saved);

        EquipmentResponse response = equipmentService.addEquipment(request);

        assertNotNull(response);
        assertEquals("Microscope", response.getName());
        assertEquals(5, response.getQuantity());
    }

    // ===============================
    // ✅ TEST: GET ALL EQUIPMENT (LAB_MANAGER)
    // ===============================
    @Test
    void testGetAllEquipment_LabManager() {

        User user = new User();
        user.setRole(Role.LAB_MANAGER);
        user.setDepartment("CSE");
        user.setInstitution("ABC");

        Equipment eq = new Equipment();
        eq.setId(1L);
        eq.setName("Microscope");
        eq.setQuantity(5);

        when(userRepository.findByEmail("test@gmail.com"))
                .thenReturn(Optional.of(user));

        when(repository.findByDepartmentAndInstitution("CSE", "ABC"))
                .thenReturn(List.of(eq));

        when(bookingRepository.sumFutureActiveQuantity(any(), any())).thenReturn(0);
        when(maintenanceRepository.sumActiveMaintenanceQuantity(any())).thenReturn(0);

        List<EquipmentResponse> result =
                equipmentService.getAllEquipment("test@gmail.com");

        assertEquals(1, result.size());
    }

    // ===============================
    // ✅ TEST: UPDATE EQUIPMENT
    // ===============================
    @Test
    void testUpdateEquipment() {

        Equipment existing = new Equipment();
        existing.setId(1L);
        existing.setName("Old");
        existing.setQuantity(5);

        EquipmentRequest request = new EquipmentRequest();
        request.setName("Updated");
        request.setQuantity(10);

        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(repository.save(any())).thenReturn(existing);
        when(bookingRepository.sumFutureActiveQuantity(any(), any())).thenReturn(0);
        when(maintenanceRepository.sumActiveMaintenanceQuantity(any())).thenReturn(0);

        EquipmentResponse response =
                equipmentService.updateEquipment(1L, request);

        assertEquals("Updated", response.getName());
        assertEquals(10, response.getQuantity());
    }

    // ===============================
    // ✅ TEST: DELETE EQUIPMENT
    // ===============================
    @Test
    void testDeleteEquipment() {

        when(repository.existsById(1L)).thenReturn(true);
        when(bookingRepository.findByEquipmentId(1L))
                .thenReturn(new ArrayList<>());

        equipmentService.deleteEquipment(1L);

        verify(repository).deleteById(1L);
    }

    // ===============================
    // ✅ TEST: GET BY ID
    // ===============================
    @Test
    void testGetEquipmentById() {

        Equipment eq = new Equipment();
        eq.setId(1L);
        eq.setName("Microscope");
        eq.setQuantity(5);

        when(repository.findById(1L)).thenReturn(Optional.of(eq));
        when(bookingRepository.sumFutureActiveQuantity(any(), any())).thenReturn(0);
        when(maintenanceRepository.sumActiveMaintenanceQuantity(any())).thenReturn(0);

        EquipmentResponse response =
                equipmentService.getEquipmentById(1L);

        assertEquals("Microscope", response.getName());
    }

    // ===============================
    // ✅ TEST: UPDATE EQUIPMENT STATUS
    // ===============================
    @Test
    void testUpdateEquipmentStatus() {

        Equipment eq = new Equipment();
        eq.setId(1L);
        eq.setStatus(EquipmentStatus.AVAILABLE);
        eq.setQuantity(10);

        when(repository.findById(1L)).thenReturn(Optional.of(eq));
        when(repository.save(any()))
                .thenAnswer(invocation -> invocation.getArgument(0));

        EquipmentResponse response =
                equipmentService.updateEquipmentStatus(1L, EquipmentStatus.UNDER_MAINTENANCE);

        assertEquals(EquipmentStatus.UNDER_MAINTENANCE, response.getStatus());
    }
}