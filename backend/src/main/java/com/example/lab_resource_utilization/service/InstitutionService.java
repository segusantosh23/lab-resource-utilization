package com.example.lab_resource_utilization.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.lab_resource_utilization.entity.Institution;
import com.example.lab_resource_utilization.repository.InstitutionRepository;

@Service
public class InstitutionService {

    private final InstitutionRepository repository;

    public InstitutionService(InstitutionRepository repository) {
        this.repository = repository;
    }

    // Get all institutions
    public List<Institution> getAllInstitutions() {
        return repository.findAll();
    }

    // Get institution by ID
    public Optional<Institution> getInstitutionById(String id) {
        return repository.findById(id);
    }

    // Add new institution
    public Institution saveInstitution(Institution institution) {
        return repository.save(institution);
    }

    // Update existing institution
    public Institution updateInstitution(String id, Institution institution) {

        Institution existingInstitution = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Institution not found"));

        existingInstitution.setName(institution.getName());
        existingInstitution.setAddress(institution.getAddress());
        existingInstitution.setEmail(institution.getEmail());
        existingInstitution.setPhone(institution.getPhone());

        return repository.save(existingInstitution);
    }

    // Delete institution
    public void deleteInstitution(String id) {

        if (!repository.existsById(id)) {
            throw new RuntimeException("Institution not found");
        }

        repository.deleteById(id);
    }
}