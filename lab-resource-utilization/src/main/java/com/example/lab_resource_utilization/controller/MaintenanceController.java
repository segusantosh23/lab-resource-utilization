package com.example.lab_resource_utilization.controller;

import com.example.lab_resource_utilization.dto.MaintenanceRequestDTO;
import com.example.lab_resource_utilization.dto.StatusUpdateDTO;
import com.example.lab_resource_utilization.entity.MaintenanceRequest;
import com.example.lab_resource_utilization.entity.User;
import com.example.lab_resource_utilization.service.MaintenanceService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
@CrossOrigin(origins = "*")
public class MaintenanceController {

    private final MaintenanceService service;

    public MaintenanceController(MaintenanceService service) {
        this.service = service;
    }

    @GetMapping
    public List<MaintenanceRequest> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public MaintenanceRequest getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public MaintenanceRequest create(@RequestBody MaintenanceRequestDTO dto) {
        return service.create(dto);
    }

    @PutMapping("/{id}/status")
    public MaintenanceRequest updateStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateDTO dto
    ) {
        return service.updateStatus(id, dto.getStatus());
    }

    // NEW API
    @GetMapping("/technicians")
    public List<User> getTechnicians() {
        return service.getLabTechnicians();
    }
    @GetMapping("/technician/{name}")
    public List<MaintenanceRequest> getByTechnician(
            @PathVariable String name
    ) {
        return service.getByTechnician(name);
    }
}