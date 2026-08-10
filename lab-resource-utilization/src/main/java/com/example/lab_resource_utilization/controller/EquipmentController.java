package com.example.lab_resource_utilization.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.lab_resource_utilization.dto.EquipmentRequest;
import com.example.lab_resource_utilization.dto.EquipmentResponse;
import com.example.lab_resource_utilization.entity.EquipmentStatus;
import com.example.lab_resource_utilization.service.EquipmentService;
import java.security.Principal;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/equipment")
public class EquipmentController {

    @Autowired
    private EquipmentService service;

    // Add Equipment — 201 CREATED
    @PostMapping
    @PreAuthorize("hasAnyRole('LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<EquipmentResponse> add(@Valid @RequestBody EquipmentRequest request) {
        EquipmentResponse response = service.addEquipment(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Get All Equipment — 200 OK
    @GetMapping
    public ResponseEntity<List<EquipmentResponse>> getAll(Principal principal) {
        String email = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(
            service.getAllEquipment(email)
        );
    }
    // Get Equipment By ID — 200 OK
    @GetMapping("/{id}")
    public ResponseEntity<EquipmentResponse> getById(@PathVariable Long id) {
        EquipmentResponse response = service.getEquipmentById(id);
        return ResponseEntity.ok(response);
    }

    // Update Equipment — 200 OK
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<EquipmentResponse> update(@PathVariable Long id,
                                                    @Valid @RequestBody EquipmentRequest request) {
        EquipmentResponse response = service.updateEquipment(id, request);
        return ResponseEntity.ok(response);
    }

    // Update Equipment Status — 200 OK
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<EquipmentResponse> updateStatus(@PathVariable Long id,
                                                          @RequestParam EquipmentStatus status) {
        EquipmentResponse response = service.updateEquipmentStatus(id, status);
        return ResponseEntity.ok(response);
    }

    // Delete Equipment — 204 NO CONTENT
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteEquipment(id);
        return ResponseEntity.noContent().build();
    }
}
