package com.example.lab_resource_utilization.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.lab_resource_utilization.dto.EquipmentRequest;
import com.example.lab_resource_utilization.dto.EquipmentResponse;
import com.example.lab_resource_utilization.entity.Equipment;
import com.example.lab_resource_utilization.entity.EquipmentStatus;
import com.example.lab_resource_utilization.exception.ResourceNotFoundException;
import com.example.lab_resource_utilization.repository.EquipmentRepository;

@Service
public class EquipmentService {

    @Autowired
    private EquipmentRepository repository;

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
        return response;
    }

    // Map Request DTO -> Entity (for create and update)
    private void mapToEntity(EquipmentRequest request, Equipment equipment) {
        equipment.setName(request.getName());
        equipment.setCategory(request.getCategory());
        equipment.setDescription(request.getDescription());
        equipment.setManufacturer(request.getManufacturer());
        equipment.setModelNumber(request.getModelNumber());
        equipment.setSerialNumber(request.getSerialNumber());
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

    // Get All Equipment
    public List<EquipmentResponse> getAllEquipment() {
        return repository.findAll()
                .stream()
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
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with id: " + id));
        equipment.setStatus(status);
        return mapToResponse(repository.save(equipment));
    }

    // Delete
    public void deleteEquipment(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Equipment not found with id: " + id);
        }
        repository.deleteById(id);
    }
}