package com.example.lab_resource_utilization.repository;

import com.example.lab_resource_utilization.entity.MaintenanceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface MaintenanceRepository extends JpaRepository<MaintenanceRequest, Long> {
    List<MaintenanceRequest> findByTechnician(String technician);
}