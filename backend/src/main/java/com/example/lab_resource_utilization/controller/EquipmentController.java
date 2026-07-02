package com.example.lab_resource_utilization.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.lab_resource_utilization.entity.Equipment;
import com.example.lab_resource_utilization.service.EquipmentService;

@RestController
@RequestMapping("/api/equipment")
public class EquipmentController {

    private final EquipmentService service;

    public EquipmentController(EquipmentService service) {
        this.service = service;
    }

    // GET ALL
    @GetMapping
    public List<Equipment> getAllEquipment() {
        return service.getAllEquipment();
    }

    // GET BY ID
    @GetMapping("/{id}")
    public Optional<Equipment> getEquipment(@PathVariable String id) {
        return service.getEquipmentById(id);
    }

    // POST
    @PostMapping
    public Equipment addEquipment(@RequestBody Equipment equipment) {
        return service.saveEquipment(equipment);
    }

    // PUT
    @PutMapping("/{id}")
    public Equipment updateEquipment(@PathVariable String id,
                                     @RequestBody Equipment equipment) {
        return service.updateEquipment(id, equipment);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String deleteEquipment(@PathVariable String id) {
        service.deleteEquipment(id);
        return "Equipment deleted successfully";
    }
}