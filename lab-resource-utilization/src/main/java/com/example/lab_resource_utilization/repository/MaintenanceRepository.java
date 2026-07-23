package com.example.lab_resource_utilization.repository;

import com.example.lab_resource_utilization.entity.MaintenanceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface MaintenanceRepository extends JpaRepository<MaintenanceRequest, Long> {
    List<MaintenanceRequest> findByTechnician(String technician);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(m.quantity), 0) FROM MaintenanceRequest m WHERE m.equipment = :equipmentName AND m.status IN ('Pending', 'In Progress')")
    Integer sumActiveMaintenanceQuantity(@org.springframework.data.repository.query.Param("equipmentName") String equipmentName);
}