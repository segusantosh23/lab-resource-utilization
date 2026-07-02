package com.example.lab_resource_utilization.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.lab_resource_utilization.entity.Equipment;
import com.example.lab_resource_utilization.repository.EquipmentRepository;

@Service
public class EquipmentService {

    private final EquipmentRepository repository;

    public EquipmentService(EquipmentRepository repository) {
        this.repository = repository;
    }

    // GET ALL
    public List<Equipment> getAllEquipment() {
        return repository.findAll();
    }

    // GET BY ID
    public Optional<Equipment> getEquipmentById(String id) {
        return repository.findById(id);
    }

    // POST
    public Equipment saveEquipment(Equipment equipment) {
        return repository.save(equipment);
    }

    // PUT
    public Equipment updateEquipment(String id, Equipment equipment) {

        Optional<Equipment> existing = repository.findById(id);

        if (existing.isPresent()) {

            Equipment updated = existing.get();

            updated.setName(equipment.getName());
            updated.setCategory(equipment.getCategory());
            updated.setDescription(equipment.getDescription());
            updated.setStatus(equipment.getStatus());
            updated.setInstitutionId(equipment.getInstitutionId());

            return repository.save(updated);
        }

        return null;
    }

    // DELETE
    public void deleteEquipment(String id) {
        repository.deleteById(id);
    }

}