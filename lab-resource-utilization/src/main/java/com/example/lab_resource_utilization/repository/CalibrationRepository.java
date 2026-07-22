package com.example.lab_resource_utilization.repository;

import com.example.lab_resource_utilization.entity.Calibration;
import com.example.lab_resource_utilization.entity.CalibrationResult;
import com.example.lab_resource_utilization.entity.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CalibrationRepository extends JpaRepository<Calibration, Long> {

    // Get calibration history of an equipment
    List<Calibration> findByEquipmentOrderByCalibrationDateDesc(Equipment equipment);

    // Find latest calibration of equipment
    Optional<Calibration> findTopByEquipmentOrderByCalibrationDateDesc(Equipment equipment);

    // Find calibrations due before a given date
    List<Calibration> findByNextDueDateBefore(LocalDate date);

    // Find calibrations between two dates
    List<Calibration> findByNextDueDateBetween(LocalDate startDate, LocalDate endDate);

    // Check duplicate certificate number
    boolean existsByCertificateNumber(String certificateNumber);

    // Get all failed calibrations
    List<Calibration> findByResult(CalibrationResult result);

    // Get all active calibrations
    List<Calibration> findByResultAndNextDueDateAfter(
            CalibrationResult result,
            LocalDate date
    );
}