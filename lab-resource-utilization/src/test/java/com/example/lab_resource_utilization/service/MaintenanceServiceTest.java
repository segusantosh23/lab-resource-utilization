package com.example.lab_resource_utilization.service;

import com.example.lab_resource_utilization.dto.MaintenanceRequestDTO;
import com.example.lab_resource_utilization.entity.Equipment;
import com.example.lab_resource_utilization.entity.MaintenanceRequest;
import com.example.lab_resource_utilization.repository.EquipmentRepository;
import com.example.lab_resource_utilization.repository.MaintenanceRepository;
import com.example.lab_resource_utilization.repository.UserRepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;


@ExtendWith(MockitoExtension.class)
class MaintenanceServiceTest {


    @Mock
    private MaintenanceRepository maintenanceRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EquipmentRepository equipmentRepository;

    @InjectMocks
    private MaintenanceService service;

    // 1. Test creating maintenance request successfully
    @Test
    void testCreateMaintenanceRequest() {
        MaintenanceRequestDTO dto =
                new MaintenanceRequestDTO();
        dto.setEquipment("Microscope");
        dto.setDescription("Lens problem");
        dto.setPriority("High");
        dto.setTechnician("John");
        dto.setQuantity(1);
        Equipment equipment =
                new Equipment();
        equipment.setName("Microscope");
        equipment.setQuantity(5);
        when(equipmentRepository.findByNameIgnoreCase(any()))
                .thenReturn(Optional.of(equipment));
        MaintenanceRequest savedRequest =
                new MaintenanceRequest();
        savedRequest.setDescription("Lens problem");
        when(maintenanceRepository.save(any()))
                .thenReturn(savedRequest);
        MaintenanceRequest result =
                service.create(dto);
        assertNotNull(result);
        assertEquals(
                "Lens problem",
                result.getDescription()
        );
        verify(maintenanceRepository,
                times(1))
                .save(any());

    }
    // 2. Test when equipment is not found
    @Test
    void testCreateMaintenanceRequest_WhenEquipmentNotFound(){
        MaintenanceRequestDTO dto =
                new MaintenanceRequestDTO();
        dto.setEquipment("Unknown Equipment");
        when(equipmentRepository.findByNameIgnoreCase(any()))
                .thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> {
            service.create(dto);
        });
        verify(maintenanceRepository,
                never())
                .save(any());


    }
    // 3. Test fetching all maintenance requests
    @Test
    void testGetAllMaintenanceRequests(){
        MaintenanceRequest request1 =
                new MaintenanceRequest();
        MaintenanceRequest request2 =
                new MaintenanceRequest();
        List<MaintenanceRequest> requests =
                Arrays.asList(
                        request1,
                        request2
                );
        when(maintenanceRepository.findAll())
                .thenReturn(requests);
        List<MaintenanceRequest> result =
                service.getAll();
        assertEquals(
                2,
                result.size()
        );
        verify(maintenanceRepository)
                .findAll();
    }

    // 4. Test getting maintenance request by ID

    @Test
    void testGetMaintenanceById(){

        MaintenanceRequest request =
                new MaintenanceRequest();

        request.setId(1L);

        when(maintenanceRepository.findById(1L))
                .thenReturn(Optional.of(request));

        MaintenanceRequest result =
                service.getById(1L);
        assertNotNull(result);

        assertEquals(
                1L,
                result.getId()
        );

        verify(maintenanceRepository)
                .findById(1L);
    }

    // 5. Test updating maintenance status

    @Test
    void testUpdateMaintenanceStatus(){
        MaintenanceRequest request =
                new MaintenanceRequest();
        request.setId(1L);
        request.setEquipment("Microscope");
        request.setStatus("PENDING");
        Equipment equipment =
                new Equipment();
        equipment.setName("Microscope");
        equipment.setQuantity(5);
        when(maintenanceRepository.findById(1L))
                .thenReturn(Optional.of(request));
        when(equipmentRepository.findByNameIgnoreCase("Microscope"))
                .thenReturn(Optional.of(equipment));
        when(maintenanceRepository.save(any()))
                .thenReturn(request);

        MaintenanceRequest result =
                service.updateStatus(
                        1L,
                        "COMPLETED"
                );

        assertEquals(
                "COMPLETED",
                result.getStatus()
        );
        verify(maintenanceRepository)
                .save(request);

    }
    // 6. Test updating status when request does not exist

    @Test
    void testUpdateStatus_WhenRequestNotFound(){
        when(maintenanceRepository.findById(99L))
                .thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> {
            service.updateStatus(
                    99L,
                    "COMPLETED"
            );


        });
        verify(maintenanceRepository,
                never())
                .save(any());
    }
}