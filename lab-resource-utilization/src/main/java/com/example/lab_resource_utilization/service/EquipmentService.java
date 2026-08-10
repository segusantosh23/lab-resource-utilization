package com.example.lab_resource_utilization.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.lab_resource_utilization.repository.UserRepository;
import com.example.lab_resource_utilization.entity.User;
import com.example.lab_resource_utilization.entity.Role;
import com.example.lab_resource_utilization.dto.EquipmentRequest;
import com.example.lab_resource_utilization.dto.EquipmentResponse;
import com.example.lab_resource_utilization.entity.Equipment;
import com.example.lab_resource_utilization.entity.EquipmentStatus;
import com.example.lab_resource_utilization.exception.ResourceNotFoundException;
import com.example.lab_resource_utilization.repository.EquipmentRepository;

import com.example.lab_resource_utilization.repository.BookingRepository;
import com.example.lab_resource_utilization.entity.Booking;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EquipmentService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private EquipmentRepository repository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private com.example.lab_resource_utilization.repository.MaintenanceRepository maintenanceRepository;

    // Convert Entity -> Response DTO
    private EquipmentResponse mapToResponse(Equipment equipment) {
        EquipmentResponse response = new EquipmentResponse();
        response.setId(equipment.getId());
        response.setName(equipment.getName());
        response.setCategory(equipment.getCategory());
        response.setDescription(equipment.getDescription());
        response.setManufacturer(equipment.getManufacturer());
        response.setModelNumber(equipment.getModelNumber());
        response.setSerialNumber(equipment.getSerialNumber());
        response.setPurchaseDate(equipment.getPurchaseDate());
        response.setDepartment(equipment.getDepartment());
        response.setInstitution(equipment.getInstitution());
        response.setQuantity(equipment.getQuantity());
        response.setStatus(equipment.getStatus());

        // Calculate available quantity = total - currently active future bookings
        Integer activeQty = bookingRepository.sumFutureActiveQuantity(equipment.getId(), LocalDateTime.now());
        if (activeQty == null) activeQty = 0;

        // Subtract quantity currently under maintenance
        Integer maintenanceQty = equipment.getName() != null 
            ? maintenanceRepository.sumActiveMaintenanceQuantity(equipment.getName()) 
            : 0;
        if (maintenanceQty == null) maintenanceQty = 0;

        int totalQty = equipment.getQuantity() != null ? equipment.getQuantity() : 0;
        int available = Math.max(0, totalQty - activeQty - maintenanceQty);
        response.setAvailableQuantity(available);

        // Dynamically override status in response if all quantity is in maintenance
        if (totalQty > 0 && maintenanceQty >= totalQty) {
            response.setStatus(EquipmentStatus.UNDER_MAINTENANCE);
        } else if (response.getStatus() == EquipmentStatus.UNDER_MAINTENANCE && maintenanceQty < totalQty) {
            // If DB says it's under maintenance but it's only partial, show it as AVAILABLE so others can book
            response.setStatus(EquipmentStatus.AVAILABLE);
        }

        return response;
    }

    // Map Request DTO -> Entity (for create and update)
    private void mapToEntity(EquipmentRequest request, Equipment equipment) {
        equipment.setName(request.getName());
        equipment.setCategory(request.getCategory());
        equipment.setDescription(request.getDescription());
        equipment.setManufacturer(request.getManufacturer());
        equipment.setModelNumber(request.getModelNumber());
        String serialNumber = request.getSerialNumber();
        if (serialNumber != null && serialNumber.trim().isEmpty()) {
            serialNumber = null;
        }
        equipment.setSerialNumber(serialNumber);
        equipment.setPurchaseDate(request.getPurchaseDate());
        equipment.setDepartment(request.getDepartment());
        equipment.setInstitution(request.getInstitution());
        equipment.setQuantity(request.getQuantity());
        equipment.setStatus(request.getStatus());
    }


    // Add Equipment
    public EquipmentResponse addEquipment(EquipmentRequest request) {
        Equipment equipment = new Equipment();
        mapToEntity(request, equipment);
        return mapToResponse(repository.save(equipment));
    }

    public List<EquipmentResponse> getAllEquipment(String email) {
        if (email == null || email.trim().isEmpty()) {
            return repository.findAll().stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return repository.findAll().stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        List<Equipment> equipments = null;

        if (user.getRole() == Role.LAB_MANAGER ||
            user.getRole() == Role.DEPARTMENT_HEAD ||
            user.getRole() == Role.LAB_TECHNICIAN) {

            boolean hasDept = user.getDepartment() != null && !user.getDepartment().trim().isEmpty();
            boolean hasInst = user.getInstitution() != null && !user.getInstitution().trim().isEmpty();

            if (hasDept && hasInst) {
                equipments = repository.findByDepartmentAndInstitution(
                        user.getDepartment(),
                        user.getInstitution()
                );
            }
            if ((equipments == null || equipments.isEmpty()) && hasDept) {
                equipments = repository.findByDepartment(user.getDepartment());
            }
            if ((equipments == null || equipments.isEmpty()) && hasInst) {
                equipments = repository.findByInstitution(user.getInstitution());
            }
            if (equipments == null || equipments.isEmpty()) {
                equipments = repository.findAll();
            }
        }
        else if (user.getRole() == Role.INSTITUTION_ADMIN) {
            boolean hasInst = user.getInstitution() != null && !user.getInstitution().trim().isEmpty();
            if (hasInst) {
                equipments = repository.findByInstitution(user.getInstitution());
            }
            if (equipments == null || equipments.isEmpty()) {
                equipments = repository.findAll();
            }
        } 
        else {
            equipments = repository.findAll();
        }

        return equipments.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    // Get Equipment By Id
    public EquipmentResponse getEquipmentById(Long id) {
        Equipment equipment = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with id: " + id));
        return mapToResponse(equipment);
    }

    // Update Equipment
    public EquipmentResponse updateEquipment(Long id, EquipmentRequest request) {
        Equipment equipment = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with id: " + id));
        mapToEntity(request, equipment);
        return mapToResponse(repository.save(equipment));
    }

    // Update Status
    public EquipmentResponse updateEquipmentStatus(Long id, EquipmentStatus status) {

        Equipment equipment = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        // ✅ FORCE update
        equipment.setStatus(status);

        Equipment saved = repository.save(equipment);

        // ✅ RETURN DIRECTLY (avoid wrong mapping issues)
        EquipmentResponse response = new EquipmentResponse();
        response.setId(saved.getId());
        response.setStatus(saved.getStatus());
        response.setQuantity(saved.getQuantity());

        return response;
    }

    // Delete
    @Transactional
    public void deleteEquipment(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Equipment not found with id: " + id);
        }

        // Delete all bookings associated with this equipment first to prevent foreign key constraint violations
        List<Booking> associatedBookings = bookingRepository.findByEquipmentId(id);
        if (!associatedBookings.isEmpty()) {
            bookingRepository.deleteAll(associatedBookings);
        }
        
        repository.deleteById(id);
    }
}