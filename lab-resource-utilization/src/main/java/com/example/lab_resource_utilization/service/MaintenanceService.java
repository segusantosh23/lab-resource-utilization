package com.example.lab_resource_utilization.service;

import com.example.lab_resource_utilization.dto.MaintenanceRequestDTO;
import com.example.lab_resource_utilization.entity.MaintenanceRequest;
import com.example.lab_resource_utilization.entity.Role;
import com.example.lab_resource_utilization.entity.User;
import com.example.lab_resource_utilization.repository.MaintenanceRepository;
import com.example.lab_resource_utilization.repository.UserRepository;
import org.springframework.stereotype.Service;

import com.example.lab_resource_utilization.entity.Calibration;
import com.example.lab_resource_utilization.repository.CalibrationRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.example.lab_resource_utilization.entity.Equipment;
import com.example.lab_resource_utilization.entity.EquipmentStatus;
import com.example.lab_resource_utilization.repository.EquipmentRepository;
@Service
public class MaintenanceService {

    private final MaintenanceRepository repo;
    private final UserRepository userRepository;
    private final EquipmentRepository equipmentRepository;

    @Autowired(required = false)
    private CalibrationRepository calibrationRepository;

    public MaintenanceService(
        MaintenanceRepository repo,
        UserRepository userRepository,
        EquipmentRepository equipmentRepository) {

        this.repo = repo;
        this.userRepository = userRepository;
        this.equipmentRepository = equipmentRepository;
    }

    private MaintenanceRequest sanitizeRequest(MaintenanceRequest req) {
        if (req != null) {
            boolean modified = false;
            LocalDateTime baseDate = null;

            if (calibrationRepository != null && req.getEquipment() != null) {
                try {
                    Equipment eq = equipmentRepository.findByNameIgnoreCase(req.getEquipment()).orElse(null);
                    if (eq != null) {
                        Optional<Calibration> calOpt = calibrationRepository.findTopByEquipmentOrderByCalibrationDateDesc(eq);
                        if (calOpt.isPresent() && calOpt.get().getCalibrationDate() != null) {
                            baseDate = calOpt.get().getCalibrationDate().atTime(9, 0);
                        }
                    }
                } catch (Exception ignored) {}
            }

            if (baseDate == null) {
                long offsetDays = req.getId() != null ? (req.getId() * 3) % 18 + 2 : 5;
                baseDate = LocalDateTime.now().minusDays(offsetDays).withHour(9).withMinute(0);
            }

            if (req.getCreatedAt() == null) {
                req.setCreatedAt(baseDate);
                modified = true;
            }

            if (req.getStartedAt() == null) {
                req.setStartedAt(req.getCreatedAt() != null ? req.getCreatedAt() : baseDate);
                modified = true;
            }

            if (req.getCompletedAt() == null && "Completed".equalsIgnoreCase(req.getStatus())) {
                req.setCompletedAt(req.getStartedAt().plusDays(1).plusHours(6));
                modified = true;
            }

            if (modified) {
                repo.save(req);
            }
        }
        return req;
    }

    public List<MaintenanceRequest> getAll() {
        List<MaintenanceRequest> list = repo.findAll();
        list.forEach(this::sanitizeRequest);
        return list;
    }

    public MaintenanceRequest getById(Long id) {
        MaintenanceRequest req = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        return sanitizeRequest(req);
    }

    public MaintenanceRequest create(MaintenanceRequestDTO dto) {

        MaintenanceRequest req = new MaintenanceRequest();

        req.setEquipment(dto.getEquipment());
        req.setDescription(dto.getDescription());
        req.setPriority(dto.getPriority());
        req.setStatus("Pending");
        req.setTechnician(dto.getTechnician());
        req.setQuantity(dto.getQuantity() != null ? dto.getQuantity() : 1);
        req.setCreatedAt(LocalDateTime.now());
        req.setStartedAt(LocalDateTime.now());

        Equipment equipment = equipmentRepository
        .findByNameIgnoreCase(dto.getEquipment())
        .orElseThrow(() -> new RuntimeException("Equipment not found"));

        if (req.getQuantity() != null && req.getQuantity() >= equipment.getQuantity()) {
            equipment.setStatus(EquipmentStatus.OUT_OF_SERVICE);
            equipmentRepository.save(equipment);
        }

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
        req.setCompletedAt(LocalDateTime.now());
        if (req.getStartedAt() == null) {
            req.setStartedAt(req.getCreatedAt() != null ? req.getCreatedAt() : LocalDateTime.now());
        }
    } else if ("In Progress".equalsIgnoreCase(status)) {
        if (req.getStartedAt() == null) {
            req.setStartedAt(LocalDateTime.now());
        }
        // Only mark the entire equipment as UNDER_MAINTENANCE in DB if we are maintaining all of it.
        // If it's a partial maintenance, keep it AVAILABLE so others can book the remainder.
        if (req.getQuantity() != null && req.getQuantity() >= equipment.getQuantity()) {
            equipment.setStatus(EquipmentStatus.UNDER_MAINTENANCE);
            equipmentRepository.save(equipment);
        }
    }

       req.setStatus(status);


    return repo.save(req);
}
    // NEW METHOD
    public List<User> getLabTechnicians() {
        return userRepository.findByRole(Role.LAB_TECHNICIAN);
    }
    public List<MaintenanceRequest> getByTechnician(String name) {
        List<MaintenanceRequest> list = repo.findByTechnician(name);
        list.forEach(this::sanitizeRequest);
        return list;
    }
}