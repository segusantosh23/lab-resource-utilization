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

import com.example.lab_resource_utilization.entity.Institution;
import com.example.lab_resource_utilization.service.InstitutionService;

@RestController
@RequestMapping("/api/institutions")
public class InstitutionController {

    private final InstitutionService service;

    public InstitutionController(InstitutionService service) {
        this.service = service;
    }

    // GET All
    @GetMapping
    public List<Institution> getAllInstitutions() {
        return service.getAllInstitutions();
    }

    // GET By ID
    @GetMapping("/{id}")
    public Optional<Institution> getInstitution(@PathVariable String id) {
        return service.getInstitutionById(id);
    }

    // POST
    @PostMapping
    public Institution addInstitution(@RequestBody Institution institution) {
        return service.saveInstitution(institution);
    }

    // PUT
    @PutMapping("/{id}")
    public Institution updateInstitution(@PathVariable String id,
                                         @RequestBody Institution institution) {
        return service.updateInstitution(id, institution);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String deleteInstitution(@PathVariable String id) {
        service.deleteInstitution(id);
        return "Institution deleted successfully";
    }
}