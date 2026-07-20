package com.example.lab_resource_utilization.service;

import com.example.lab_resource_utilization.dto.MaintenanceRequestDTO;
import com.example.lab_resource_utilization.entity.MaintenanceRequest;
import com.example.lab_resource_utilization.entity.Role;
import com.example.lab_resource_utilization.entity.User;
import com.example.lab_resource_utilization.repository.MaintenanceRepository;
import com.example.lab_resource_utilization.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

import com.example.lab_resource_utilization.entity.Equipment;
import com.example.lab_resource_utilization.entity.EquipmentStatus;
import com.example.lab_resource_utilization.repository.EquipmentRepository;
@Service
public class MaintenanceService {

    private final MaintenanceRepository repo;
    private final UserRepository userRepository;
    private final EquipmentRepository equipmentRepository;
    public MaintenanceService(
        MaintenanceRepository repo,
        UserRepository userRepository,
        EquipmentRepository equipmentRepository) {

        this.repo = repo;
        this.userRepository = userRepository;
        this.equipmentRepository = equipmentRepository;
    }

    public List<MaintenanceRequest> getAll() {
        return repo.findAll();
    }

    public MaintenanceRequest getById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
    }

    public MaintenanceRequest create(MaintenanceRequestDTO dto) {

        MaintenanceRequest req = new MaintenanceRequest();

        req.setEquipment(dto.getEquipment());
        req.setDescription(dto.getDescription());
        req.setPriority(dto.getPriority());
        req.setStatus("Pending");
        req.setTechnician(dto.getTechnician());

        Equipment equipment = equipmentRepository
        .findByNameIgnoreCase(dto.getEquipment())
        .orElseThrow(() -> new RuntimeException("Equipment not found"));

        equipment.setStatus(EquipmentStatus.OUT_OF_SERVICE);
        equipmentRepository.save(equipment);

        return repo.save(req);
    }

   public MaintenanceRequest updateStatus(Long id, String status) {

    MaintenanceRequest req = getById(id);

    Equipment equipment = equipmentRepository
        .findByNameIgnoreCase(req.getEquipment())
        .orElseThrow(() -> new RuntimeException("Equipment not found"));

    if ("Completed".equalsIgnoreCase(status)) {

        equipment.setStatus(EquipmentStatus.AVAILABLE);

        equipmentRepository.save(equipment);

        repo.deleteById(id);

        return null;
    }

    if ("In Progress".equalsIgnoreCase(status)) {

        equipment.setStatus(EquipmentStatus.UNDER_MAINTENANCE);

        equipmentRepository.save(equipment);
    }

    req.setStatus(status);

    return repo.save(req);
}
    // NEW METHOD
    public List<User> getLabTechnicians() {
        return userRepository.findByRole(Role.LAB_TECHNICIAN);
    }
    public List<MaintenanceRequest> getByTechnician(String name) {
        return repo.findByTechnician(name);
    }
}