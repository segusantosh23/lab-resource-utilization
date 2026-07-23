package com.example.lab_resource_utilization.repository;

import com.example.lab_resource_utilization.entity.Equipment;
import com.example.lab_resource_utilization.entity.EquipmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {

    List<Equipment> findByStatus(EquipmentStatus status);

    List<Equipment> findByDepartment(String department);

    List<Equipment> findByInstitution(String institution);

    List<Equipment> findByNameContainingIgnoreCase(String name);
    List<Equipment> findByDepartmentAndInstitution(
        String department,
        String institution
);

    Optional<Equipment> findByNameIgnoreCase(String name);
}